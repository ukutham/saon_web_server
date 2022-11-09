from django.shortcuts import render
from django.template import loader
from django.template import Library
from django.http import HttpResponse

from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from article.models import *
from saon_web_server.permissions import AlwaysPermission, IsAuthenticated

from basket.models import Basket, Product
from order.models import Order, ProductOrder

from delivery_choice.models import delivery_address

from time import sleep
import re
from datetime import date, timedelta

def nav_bar(request):
	template = loader.get_template('nav_bar/nav_bar_2.html')
	if 'page' in request.GET and request.GET['page'] in ['menu', 'location', 'soap', 'basket', 'account']:
		context = {
			'page': request.GET['page'],
		}
	else:
		context = {
		'page': 'menu',
	}
	
	return HttpResponse(template.render(context, request=request))

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def test_token(request):
	return Response({'token' : 'valid'})

@api_view(['GET'])
@permission_classes([AlwaysPermission])
def menu(request):
	template = loader.get_template('menu/menu.html')
	return HttpResponse(template.render(request=request))


@api_view(['GET'])
@permission_classes([AlwaysPermission])
def location(request):
	template = loader.get_template('location/location.html')
	return HttpResponse(template.render(request=request))


@api_view(['GET'])
@permission_classes([AlwaysPermission])
def soap(request):
	all_product = {}

	for article_type in Article_type.objects.all().order_by('id'):
		all_product[article_type.name] = []
		for article in Article.objects.filter(article_type=article_type,available=True).order_by('name'):
			all_product[article_type.name].append({
				'id': article.id,
				'name': article.name,
				'ingredient': article.principal_ingredients,
				'photo': article.principal_image.url,
				})

	n_product = 0

	if request.user and request.user.is_authenticated:
		if Basket.objects.filter(create_by=request.user).exists():
			basket = Basket.objects.get(create_by=request.user)
			for product in Product.objects.filter(basket=basket):
				n_product += product.number

	template = loader.get_template('soap/soap.html')
	return HttpResponse(template.render({'all_product': all_product, 'n_product': n_product},request=request))


@api_view(['GET'])
@permission_classes([AlwaysPermission])
def basket(request):
	if request.user and request.user.is_authenticated:

		template = loader.get_template('basket/basket.html')

		if Basket.objects.filter(create_by=request.user).exists():
			basket = Basket.objects.get(create_by=request.user)
			if Product.objects.filter(basket=basket).exists():
				soaps_in_basket = []
				for product in Product.objects.filter(basket=basket):
					soaps_in_basket.append (
						{	
							'id': product.id,
							'soap':{
								'name': product.article.name,
								'ingredient': product.article.principal_ingredients,
								'photo': product.article.principal_image.url,
							},
							'option': {
								'view_name': product.option.view_name,
								'cost': product.option.cost,
							},
							'number': product.number,
							'total_cost': product.option.cost * product.number,
						},
					)

				return HttpResponse(template.render({'connected': True,'soaps_in_basket': soaps_in_basket}, request=request))

		return HttpResponse(template.render({'connected': True,'soaps_in_basket': None}, request=request))

	else :
		template = loader.get_template('basket/basket.html')
		return HttpResponse(template.render({'connected': False}, request=request))

@api_view(['GET'])
@permission_classes([AlwaysPermission])
def delivery_choice(request):
	template = loader.get_template('delivery_choice_autorizer/delivery_choice_autorizer.html')
	return HttpResponse(template.render(request=request))


@api_view(['GET'])
@permission_classes([AlwaysPermission])
def account(request):
	if request.user.is_authenticated:
		if not request.user.email_activate:
			template = loader.get_template('go_to_mail_send_page/go_to_mail_send_page.html')
			return HttpResponse(template.render(request=request))

		delivery_address_queryset = delivery_address.objects.filter(create_by=request.user)
		delivery_address_queryset = sorted(list(delivery_address_queryset),key=lambda s:list(map(lambda x:int(x) if x.isdigit() else x,re.split(r'(\d+)',s.delivery_address)[1:])))

		user = {
			'name': request.user.name,
			'surname': request.user.surname,
			'phone_number': request.user.phone_number,
			'mail': request.user.email,
			'addresses': delivery_address_queryset,
			'id': request.user.id,
			'is_staff': request.user.is_staff,
		}

		order_of_user = [i for i in Order.objects.filter(create_by=request.user).order_by('-id').values()]

		for i in order_of_user:
			actual_order = Order.objects.get(id=i['id'])
			i['livraison_mode'] = actual_order.get_livraison_mode_display()
			i['dev_state'] = actual_order.get_state_display()
			i['livrate_date_1'] = (actual_order.creation_date + timedelta(days=2)).strftime('%d-%m-%Y').replace('-', '/')
			i['livrate_date_2'] = (actual_order.creation_date + timedelta(days=5)).strftime('%d-%m-%Y').replace('-', '/')
			i['facture'] = actual_order.facture
			i['facture_name'] = f'{i["facture_id"]}.pdf'
			i['creation_date'] = actual_order.creation_date.strftime('%d-%m-%Y').replace('-', '/')
			i['products'] = [x for x in ProductOrder.objects.filter(order=actual_order)]

		template = loader.get_template('account/account.html')
		return HttpResponse(template.render({'user': user, 'orders': order_of_user}, request=request))

	else :
		template = loader.get_template('connection/connection.html')
		return HttpResponse(template.render(request=request))


from account.models import User, UserManager
from django.core.mail import send_mail

@api_view(['GET', 'POST'])
@permission_classes([AlwaysPermission])
def password_forgot(request):
	template = loader.get_template('password_forgot/password_forgot.html')

	if request.method == 'GET':
		return HttpResponse(template.render(request=request))

	if 'email' not in request.data:
		return HttpResponse(template.render({ 'error': 'request non valide' }, request=request ))

	if not User.objects.filter(email=request.data['email']).exists():
		return HttpResponse(template.render({ 'error': "cet email n'existe pas" }, request=request ))

	user = User.objects.get(email=request.data['email'])

	if user.url_password_forgot == '0':
		user.url_password_forgot = UserManager.get_url_password_forgot()
		user.save()

	split_url = request.build_absolute_uri().split('/')
	hostname = f'{split_url[0]}//{split_url[2]}'

	send_mail(
	    subject = 'Changement de mot de passe',
        message = loader.render_to_string('email_password_forgot_template/email_password_forgot_template.html', {'url_password_forgot': user.url_password_forgot, 'hostname': hostname, 'host': split_url[2]}),
        html_message = loader.render_to_string('email_password_forgot_template/email_password_forgot_template.html', {'url_password_forgot': user.url_password_forgot, 'hostname': hostname, 'host': split_url[2]}),
        from_email = 'michique.pinson@gmail.com',
        recipient_list = [user.email],
        fail_silently = False,
	)

	sleep(1)

	template = loader.get_template('password_forgot_email/password_forgot_email.html')
	return HttpResponse(template.render(request=request))