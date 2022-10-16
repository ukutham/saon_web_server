from django.shortcuts import render
import stripe
from django.shortcuts import redirect
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.template import loader
from django.http import HttpResponse, Http404
from django.shortcuts import get_object_or_404, render
from django.http import FileResponse
import os
from saon_web_server.permissions import FactureViewPermission

import json
from datetime import date, timedelta

from delivery_choice.models import AddressSelect
from article.models import Article, Article_options
from basket.models import Basket, Product
from order.models import *
from delivery_choice.models import AddressSelect
from .odt import odtRender
from account.models import User

stripe.api_key = 'sk_test_51LoVkzGv1JxcHciCMwVe4W4gKJaeJAHZCOG2Q9BtcNBfr8vI7fL1DBgewHtvT7ttpRGaQ55HccXLz0i2035ANX8A00L2P4cP6t'

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def go_to_payment_page(request):
	user_select_address = AddressSelect.objects.get(create_by=request.user)

	if user_select_address.livraison_mode == 'colissimo':
		livraison_mode = 'C'
	elif user_select_address.livraison_mode == 'mondial relay':
		livraison_mode = 'M'
	else :
		livraison_mode = 'C'

	if ' France métropolitaine' not in user_select_address.address.split(','):
		return Response({'detail' : 'select address not valid'}, status=status.HTTP_406_NOT_ACCEPTABLE)

	line_items = []
	metadata = {}
	total_masse = 0

	if Basket.objects.filter(create_by=request.user).exists():
		basket = Basket.objects.get(create_by=request.user)
		if Product.objects.filter(basket=basket).exists():
			for product in Product.objects.filter(basket=basket):
				if product.number > product.option.stock:
					return Response({'detail' : f'vous avez trop de {product.article.name} {product.option.view_name.replace("savon ", "")} dans votre panier'}, status=status.HTTP_406_NOT_ACCEPTABLE)

				total_masse += int(product.option.masse * 1.2 * product.number)

				line_items.append (
					{	
						'price_data': {
							'currency': 'eur',
							'product_data' : {
								'name': f"{product.article.name} {product.option.view_name.replace('savon ', '')}",
							},
							'unit_amount': int(product.option.cost * 100),
						},
						'quantity': product.number,
					})
				metadata[f"{product.article.name} {product.option.view_name.replace('savon ', '')}"] = {
					'article_name': product.article.name,
					'number' : str(product.number),
					'cost' : str(product.option.cost),
					'option_name': product.option.view_name,
					'article_id' : product.article.id,
					'option_id': product.option.id,
				}
		else:
			return Response({'detail' : 'no product in basket'})
	else:
		return Response({'detail' : 'no basket'})

	livraison_cost = get_livraison_price_by_masse(masse=total_masse / 1000, livraison_mode=livraison_mode)	

	line_items.append(
		{
			'price_data': {
				'currency': 'eur',
				'product_data' : {
					'name': "cout de livraison",
				},
				'unit_amount': int((livraison_cost.cost + livraison_cost.carton_cost) * 100),
			},
			'quantity': 1,
		})

	metadata["livraison"] = {
		"livraison_mode" : livraison_mode,
		"address" : user_select_address.address,
		"relay_id" : user_select_address.relay_id,
	}

	split_url = request.build_absolute_uri().split('/')
	hostname = f'{split_url[0]}//{split_url[2]}/'

	session = stripe.checkout.Session.create(
		customer_email=request.user.email,
		line_items=line_items,
		mode='payment',
		success_url=f'{hostname}test_payment/success/?session_id={{CHECKOUT_SESSION_ID}}',
		cancel_url=f'{hostname}delivery_choice/',
		metadata={'data': json.dumps(metadata)},
  	)

	return Response({'payment_page_url' : session.url})



def payment_success(request):
	try:
		session = stripe.checkout.Session.retrieve(request.GET['session_id'])
	except:
		raise Http404

	template = loader.get_template('payment_confirm/payment_confirm.html')

	if Order.objects.filter(stripe_session_id=request.GET['session_id']).exists():
		return HttpResponse(template.render(request=request))


	products = []

	for product in session.list_line_items()['data']:
		if product['description'] != 'cout de livraison':
			products.append(json.loads(session['metadata']['data'])[product['description']])


	request.user = User.objects.get(email=session.customer_email)

	livraison = json.loads(session['metadata']['data'])['livraison']
	livraison_mode = livraison["livraison_mode"]

	######## odt render ########

	DIRECTORY = "/home/michique/Bureau/project_web/saon_site_web_2/saon_web_server/stripe_payment_app"
	SOURCE_DIRECTORY = f"{DIRECTORY}/facture_src"
	MEDIA_DIRECTORY = "/home/michique/Bureau/project_web/saon_site_web_2/saon_web_server/media/facture"

	products_for_facture = [
		{
			'desc': "Description",
			'quant': "Quantités",
			'unite': "Unités",
			'unite_price': "Prix Unitaire TTC",
			'pourc_tva': "TVA %",
			'tva': "TVA",
			'total': "Total TTC",
		},
	]

	total_tva = 0
	total_ttc = 0
	total_masse = 0

	for product in products:
		products_for_facture.append({
			'desc': f'{product["article_name"]} {product["option_name"].replace("savon ", "")}',
			'quant': product['number'],
			'unite': "pce.",
			'unite_price': f"{product['cost']} €",
			'pourc_tva': "20%",
			'tva': str(round(float(product['cost']) * float(product['number']) * 0.2, 2))+'€',
			'total': f"{float(product['cost']) * float(product['number'])}€",
		})

		total_ttc += float(product['cost']) * float(product['number'])

		if Article.objects.filter(id=product['article_id']).exists():
			article_option = Article_options.objects.filter(id=product['option_id'])
			if article_option.exists():
				total_masse += int(article_option[0].masse * 1.2 * int(product['number']))
				article_option.update(stock = (article_option[0].stock - int(product['number'])))
				if article_option[0].stock < 0:
					article_option.update(stock = 0)

	livraison_cost = get_livraison_price_by_masse(masse=total_masse / 1000, livraison_mode=livraison_mode)

	total_tva = total_ttc * 0.2
	total_ttc += float(livraison_cost.cost)

	new_order_data = {
		"stripe_session_id" : request.GET['session_id'],
		"name" : request.user.name,
		"surname" : request.user.surname,
		"email" : request.user.email,
		"address" : livraison["address"],
		"relay_id" : livraison["relay_id"],
		"cost_TTC" : total_ttc,
		"livraison_mode" : livraison_mode,
		"state" : '0',
		"create_by" : request.user,
	}

	new_order = Order.objects.create(**new_order_data)

	for product_order in products:
		del product_order['article_id']
		del product_order['option_id']
		ProductOrder.objects.create(**product_order, order=new_order, create_by=request.user)

	today_date = date.today()
	str_today_date = today_date.strftime('%d-%m-%Y').replace('-', '/')

	data = {
		'facture_ref': new_order.id,
		'facture_date': str_today_date,
		'client_n': request.user.id,
		'send_date': str_today_date,
		'payment_date': str_today_date,
		'livraison_delay': f"du {(today_date + timedelta(days=2)).strftime('%d-%m-%Y').replace('-', '/')} au {(today_date + timedelta(days=5)).strftime('%d-%m-%Y').replace('-', '/')}",
		'saon_rue': "8 chemin du Bel Air",
		'saon_ville': "78200, Magnanville",
		'saon_pays': "France",
		'saon_naf_code': "20.41Z",
		'saon_siret': "913 715 496 00018",
		'saon_n_tva': "FR26 913 715 496",
		'saon_mail': "savonnerie.saon@gmail.com",
		'saon_tel': "0766005088",
		'dest_name': f'{request.user.name} {request.user.surname}',
		'dest_mail': request.user.email,
		'dest_address': livraison["address"],
		'products': products_for_facture,
		'total_tva': f"{round(total_tva, 2)}€",
		'livraison_cost': f'{livraison_cost.cost + livraison_cost.carton_cost}€',
		'total_ttc': f"{total_ttc}€",
		}

	new_facture = odtRender(DIRECTORY, source=SOURCE_DIRECTORY)
	new_facture.extract_file_to_source(f"{DIRECTORY}/facture.odt", 'facture_src')
	new_facture.render(data, new_order.id, MEDIA_DIRECTORY)

	############################

	new_order.facture.name = f"facture/{new_order.id}.pdf"
	new_order.save()

	return HttpResponse(template.render(request=request))

@api_view(['GET'])
@permission_classes([FactureViewPermission])
def secure_facture(request, file):
	document=get_object_or_404(Order,facture="facture/"+file)
	response=FileResponse(document.facture)
	return response
