from time import sleep
import string
import random

import phonenumbers

from rest_framework.viewsets import ReadOnlyModelViewSet, ModelViewSet
from rest_framework import serializers, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db import transaction
from rest_framework.decorators import api_view, permission_classes
from django.template import loader
from django.http import HttpResponse, Http404
from django.core.mail import send_mail
from django.core.validators import validate_email
from django.contrib.auth.hashers import make_password

from django.templatetags.static import static

from rest_framework.permissions import IsAuthenticated

from .models import User, UserManager
from .serializers import UserSerializer, CreateUserSerializer
from saon_web_server.permissions import AlwaysPermission, DefaultPermission, CreationPermission, EmailNotActivatePermission, UserSeePermission, UserModifyPermission, UserModifyEmailPermission, UserRemovePermission

@api_view(['GET'])
@permission_classes([AlwaysPermission])
def mail_send_page(request):
	template = loader.get_template('mail_send_page/mail_send_page.html')
	sleep(1)
	return HttpResponse(template.render(request=request))


@api_view(['GET'])
@permission_classes([AlwaysPermission])
def validation_page(request, url_activation_email):
	if url_activation_email == '0':
		raise Http404

	if not User.objects.filter(url_activation_email=url_activation_email).exists():
		raise Http404

	user = User.objects.get(url_activation_email=url_activation_email)
	user.email_activate = True
	user.url_activation_email = '0'

	user.save()

	template = loader.get_template('validation_page/validation_page.html')
	return HttpResponse(template.render(request=request))

@api_view(['GET'])
@permission_classes([AlwaysPermission])
def change_email(request):
	template = loader.get_template('change_email/change_email.html')
	return HttpResponse(template.render(request=request))

@api_view(['POST'])
@permission_classes([AlwaysPermission])
def set_url_password_forgot(request):
	template = loader.get_template('password_forgot/password_forgot.html')

	if 'email' not in request.data:
		return HttpResponse(template.render({ 'error': 'request non valide' }, request=request ))

	if not User.objects.filter(email=request.data['email']).exists():
		return HttpResponse(template.render({ 'error': "cet email n'existe pas" }, request=request ))

	user = User.objects.get(email=request.data['email'])

	if user.url_password_forgot == '0':
		user.url_password_forgot = UserManager.get_url_password_forgot()
		user.save()

	split_url = request.build_absolute_uri().split('/')
	hostname = f'{split_url[0]}//{split_url[2]}/'

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

@api_view(['GET'])
@permission_classes([AlwaysPermission])
def change_password_page(request, url_password_forgot):
	if url_password_forgot == '0':
		raise Http404

	if not User.objects.filter(url_password_forgot=url_password_forgot).exists():
		raise Http404

	user = User.objects.get(url_password_forgot=url_password_forgot)
	user.url_password_forgot = '0'


	characters = list(string.ascii_letters + string.digits + "!@#$%^&*")
	random.shuffle(characters)
	new_password = []
	for i in range(10):
		new_password.append(random.choice(characters))

	new_password = "".join(new_password)
	user.password = make_password(new_password)

	user.save()

	template = loader.get_template('random_password_page/random_password_page.html')
	return HttpResponse(template.render({'new_password': new_password} ,request=request))



class UserViewSet(ModelViewSet):
	serializer_class_by_action = {
		'default' :UserSerializer,
		'list' :UserSerializer,
		'retrieve' :UserSerializer,
		'create' :CreateUserSerializer,
		'send_confirm_mail': UserSerializer,
		'change_name_surname' : UserSerializer,
		'change_phone_number' :UserSerializer,
		'change_password' :UserSerializer,
		'change_email': UserSerializer,
		'remove' : UserSerializer,
	}

	permission_classes_by_action = {
		'default' :[DefaultPermission],
		'list' :[UserSeePermission],
		'retrieve' : [UserSeePermission],
		'create' :[AlwaysPermission],
		'send_confirm_mail' :[EmailNotActivatePermission],
		'change_name_surname' :[UserModifyPermission],
		'change_phone_number' :[UserModifyPermission],
		'change_password' :[UserModifyPermission],
		'change_email': [UserModifyEmailPermission],
		'remove' : [UserRemovePermission],
	}

	def get_queryset(self):

		queryset = User.objects.filter(is_active=True)

		if self.request.user and self.request.user.is_authenticated:
			account_email = self.request.user.email
			if account_email is not None:
				queryset = queryset.filter(email=account_email)

		return queryset

	@transaction.atomic
	@action(detail=False, methods=['get'])
	def send_confirm_mail(self, request):
		split_url = request.build_absolute_uri().split('/')
		hostname = f'{split_url[0]}//{split_url[2]}'

		send_mail(
		    subject = 'Validation de votre compte',
	        message = loader.render_to_string('email_validation_template/email_validation_template.html', {'url_activation_email': request.user.url_activation_email, 'hostname': hostname, 'host': split_url[2]}),
	        html_message = loader.render_to_string('email_validation_template/email_validation_template.html', {'url_activation_email': request.user.url_activation_email, 'hostname': hostname, 'host': split_url[2]}),
	        from_email = 'michique.pinson@gmail.com',
	        recipient_list = [request.user.email],
	        fail_silently=False,
		)

		sleep(1)

		return Response()

	@transaction.atomic
	@action(detail=False, methods=['post'])
	def change_name_surname(self, request):
		if 'name' in request.data or 'surname' in request.data:
			if request.data['name'] == '':
				return Response(data={'name': 'veuillez remplir tous les champs'} ,status=status.HTTP_400_BAD_REQUEST)
			elif request.data['surname'] == '':
				return Response(data={'surname': 'veuillez remplir tous les champs'} ,status=status.HTTP_400_BAD_REQUEST)

			request.user.name = request.data['name']
			request.user.surname = request.data['surname']
			request.user.save()

			return Response(data={'Modification': 'ok'})
		else:
			return Response(status=status.HTTP_400_BAD_REQUEST)


	@transaction.atomic
	@action(detail=False, methods=['post'])
	def change_phone_number(self, request):
		if 'phone_number' not in request.data:
			return Response(status=status.HTTP_400_BAD_REQUEST)

		value = f'+33{request.data["phone_number"]}'
		try:
			phone_number = phonenumbers.parse(value)
			if not phonenumbers.is_possible_number(phone_number):
				return Response(data={'phone_number': 'numéro de téléphone invalide'} ,status=status.HTTP_400_BAD_REQUEST)
		except:
			return Response(data={'phone_number': 'numéro de téléphone invalide'} ,status=status.HTTP_400_BAD_REQUEST)

		request.user.phone_number = request.data['phone_number']
		request.user.save()

		return Response(data={'Modification': 'ok'})


	@transaction.atomic
	@action(detail=False, methods=['post'])
	def change_email(self, request):
		if 'email' in request.data:
			user = request.user
			new_email = request.data.get('email')

			if User.objects.filter(email=new_email).exists():
				return Response(data={'email': 'email déjà utilisé'}, status=status.HTTP_400_BAD_REQUEST)
			try :
				validate_email(new_email)
			except :
				return Response(data={'email': 'email non valide'}, status=status.HTTP_400_BAD_REQUEST)

			user.email = new_email
			user.url_activation_email = UserManager.get_url_activation_email()
			user.email_activate = False
			user.save()

			return Response(data={'email': 'ok'})
		else:
			return Response(status=status.HTTP_400_BAD_REQUEST)

	@transaction.atomic
	@action(detail=False, methods=['post'])
	def change_password(self, request):
		if 'old_password' in request.data and 'new_password' in request.data:
			user = request.user
			if user.check_password(request.data.get('old_password')):
				if request.data.get('new_password') == "":
					return Response(data={'password': 'nouveau mot de passe vide'})

				user.password = make_password(request.data.get('new_password'))
				user.save()

				return Response(data={'request': 'ok'})

			else:
				return Response(data={'password': 'mot de passe incorrect'}, status=status.HTTP_400_BAD_REQUEST)
		else:
			return Response(status=status.HTTP_400_BAD_REQUEST)

	@transaction.atomic
	@action(detail=False, methods=['delete'])
	def remove(self, request):
		request.user.delete()

		return Response({f'Account': 'remove'}, status=status.HTTP_200_OK)

	def get_permissions(self):
		try:
			return [permission() for permission in self.permission_classes_by_action[self.action]]
		except KeyError:
			return [permission() for permission in self.permission_classes_by_action['default']]

	def get_serializer_class(self):
		try:
			return self.serializer_class_by_action[self.action]
		except KeyError:
			return self.serializer_class_by_action['default']
