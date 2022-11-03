from PyPDF2 import PdfFileMerger
import os

from django.shortcuts import render
from django.template import loader
from django.template import Library
from django.http import HttpResponse, FileResponse
from rest_framework.permissions import IsAuthenticated
from datetime import date, timedelta, datetime
from rest_framework import status

from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from saon_web_server.permissions import IsStaffUser

from article.models import *
from order.models import *
from account.models import *

def nav_bar(request):
	template = loader.get_template('nav_bar/admin_nav_bar.html')
	if 'page' in request.GET and request.GET['page'] in ['location_admin', 'article', 'order', 'account_admin', 'comptability']:
		context = {
			'page': request.GET['page'],
		}
	else:
		context = {
		'page': 'order',
	}
	
	return HttpResponse(template.render(context, request=request))

######################################################

@api_view(['GET'])
@permission_classes([IsStaffUser])
def article(request):
	all_product = {}
	article_types = {}

	for article_type in Article_type.objects.all().order_by('id'):
		all_product[article_type] = []
		article_types[article_type] = {
			'name' : article_type.name,
			'id' : article_type.id,
		}
		for article in Article.objects.filter(article_type=article_type).order_by('name'):
			all_product[article_type].append({
				'id': article.id,
				'name': article.name,
				'ingredient': article.principal_ingredients,
				'photo': article.principal_image.url,
				})


	template = loader.get_template('article/article.html')
	return HttpResponse(template.render({'all_product': all_product, 'article_types': article_types},request=request))

######################################################

@api_view(['GET'])
@permission_classes([IsStaffUser])
def order(request):
	if 'account' not in request.GET:
		dates = {}
		for order in Order.objects.all().order_by('-creation_date'):
			if order.creation_date not in dates.keys():
				dates[order.creation_date] = Order.objects.filter(creation_date = order.creation_date).order_by('id')

		for key, orders in dates.items():
			for i in orders:
				actual_order = Order.objects.get(id=i.id)
				i.dev_livraison_mode = actual_order.get_livraison_mode_display()
				i.dev_state = actual_order.get_state_display()
				i.livrate_date_1 = (actual_order.creation_date + timedelta(days=2)).strftime('%d-%m-%Y').replace('-', '/')
				i.livrate_date_2 = (actual_order.creation_date + timedelta(days=5)).strftime('%d-%m-%Y').replace('-', '/')
				i.facture = actual_order.facture
				i.facture_name = f'SAON_facture_{i.id}.pdf'
				i.creation_date = actual_order.creation_date.strftime('%d-%m-%Y').replace('-', '/')
				i.products = [x for x in ProductOrder.objects.filter(order=actual_order)]
				i.create_by = actual_order.create_by

		template = loader.get_template('order/order.html')
		return HttpResponse(template.render({'dates_or_acounts': dates},request=request))

	else :
		things_search = request.GET['account'].lower()

		account_queryset = User.objects.all()
		for user in account_queryset:
			if things_search not in user.name.lower() and things_search not in user.surname.lower() and things_search not in user.email.lower():
				account_queryset = account_queryset.exclude(email=user.email)

		order_by_account = {}
		for user in account_queryset:
			order_by_account[f'{user.name} {user.surname}, {user.email}'] = Order.objects.filter(create_by=user)

		for key, orders in order_by_account.items():
			for i in orders:
				actual_order = Order.objects.get(id=i.id)
				i.dev_livraison_mode = actual_order.get_livraison_mode_display()
				i.dev_state = actual_order.get_state_display()
				i.livrate_date_1 = (actual_order.creation_date + timedelta(days=2)).strftime('%d-%m-%Y').replace('-', '/')
				i.livrate_date_2 = (actual_order.creation_date + timedelta(days=5)).strftime('%d-%m-%Y').replace('-', '/')
				i.facture = actual_order.facture
				i.facture_name = f'SAON_facture_{i.id}.pdf'
				i.creation_date = actual_order.creation_date.strftime('%d-%m-%Y').replace('-', '/')
				i.products = [x for x in ProductOrder.objects.filter(order=actual_order)]
				i.create_by = actual_order.create_by

		template = loader.get_template('order/order.html')
		return HttpResponse(template.render({'dates_or_acounts': order_by_account},request=request))


@api_view(['POST'])
@permission_classes([IsStaffUser])
def change_order_status(request, order_id):
	order = get_object_or_404(Order,id=order_id)

	if 'state' not in request.data and True in [True for x in order.STATE_OPTION if request.data['state'] in x]:
		return Response({'detail': 'le status a une valeur incorrecte'}, status=status.HTTP_400_BAD_REQUEST)
	
	order.state = request.data['state']
	order.save()

	return Response({'status': 'ok', 'dev_livraison_state': order.get_state_display(), 'livraison_state': order.state})

######################################################

@api_view(['GET'])
@permission_classes([IsStaffUser])
def comptability(request):
	dates = {}
	for order in Order.objects.all().order_by('-creation_date'):
		if order.creation_date not in dates.keys():
			dates[order.creation_date] = order.creation_date.strftime('%d-%m-%Y')

	template = loader.get_template('comptability/comptability.html')
	return HttpResponse(template.render({'dates': dates},request=request))

@api_view(['GET'])
@permission_classes([IsStaffUser])
def get_facture(request, date):
	date = datetime.strptime(date, '%d-%m-%Y')

	orders = Order.objects.filter(creation_date=date).order_by('id')

	if not orders.exists():
		return Response(status=status.HTTP_404_NOT_FOUND)

	factures = [order.facture for order in orders]

	merger = PdfFileMerger()

	for facture in factures:
	    merger.append(open(facture.path, 'rb'))

	print(os.path.dirname(os.path.abspath(__file__)))

	with open(f'{os.path.dirname(os.path.abspath(__file__))}/sum_facture/sum_facture.pdf', 'wb') as sum_facture:
	    merger.write(sum_facture)

	return FileResponse(open(f'{os.path.dirname(os.path.abspath(__file__))}/sum_facture/sum_facture.pdf', 'rb'))

######################################################

@api_view(['GET'])
@permission_classes([IsStaffUser])
def account_admin(request):
	template = loader.get_template('account_admin/account_admin.html')
	return HttpResponse(template.render(request=request))

@api_view(['POST'])
@permission_classes([IsStaffUser])
def search_account(request):
	if 'account' not in request.data:
		return Response(status=status.HTTP_400_BAD_REQUEST)

	things_search = request.data['account'].lower()

	queryset = User.objects.all()
	for user in queryset:
		if things_search not in user.name.lower() and things_search not in user.surname.lower() and things_search not in user.email.lower():
			queryset = queryset.exclude(email=user.email)


	data = []
	for user in queryset:
		data.append({
			'name': user.name,
			'surname': user.surname,
			'email': user.email,
			'phone_number': user.phone_number,
			})

	return Response({'all_acccount': data})

######################################################

@api_view(['GET'])
@permission_classes([IsStaffUser])
def location_admin(request):
	template = loader.get_template('location/location_admin.html')
	return HttpResponse(template.render(request=request))
