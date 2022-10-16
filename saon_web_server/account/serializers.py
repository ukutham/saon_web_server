from rest_framework import serializers
from rest_framework.serializers import ModelSerializer
from django.core.validators import validate_email
from django.contrib.auth.hashers import make_password
from rest_framework.response import Response
from django.http import JsonResponse

from api_insee import ApiInsee
import phonenumbers

from .models import User, UserManager

"""api = ApiInsee(
	key = 'gElBORYqjjKLLp4m0CZF9MtsfDwa',
	secret = 'swZFzWcSVczSWRCtIXwRGQlPcdQa',

)"""

class CreateUserSerializer(ModelSerializer):
	class Meta:
		model = User
		fields = ['name', 'surname', 'phone_number', 'email', 'password']

	def validate_phone_number(self, value):
		value = f'+33{value}'
		try:
			phone_number = phonenumbers.parse(value)
			if not phonenumbers.is_possible_number(phone_number):
				raise serializers.ValidationError('numéro non valide')
		except:
			raise serializers.ValidationError('numéro non valide')

		return value


	def validate_email(self, value):
		if User.objects.filter(email=value).exists():
			raise serializers.ValidationError('email déjà utilisé')
		try :
			validate_email(value)
		except :
			raise serializers.ValidationError('email non valide')
		return value

	"""def validate(self, data):
		if data['is_proffesional']:
			if data.get('siren') == None:
				raise serializers.ValidationError('siren vide')
			elif User.objects.filter(siren=data['siren']).exists():
				raise serializers.ValidationError('siren déjà utilisé')
			else:
				data['siren'] = data['siren'].replace(' ', '')
				try:
					api.siren(data['siren']).get()
				except:
					raise serializers.ValidationError('siren non valide')

		elif data.get('siren') != None:
			data['siren'] = None

		return data"""

	def create(self, validate_data):
		validate_data['password'] = make_password(validate_data['password'])
		validate_data['web_page_permission'] = "S"
		validate_data['article_permission'] = "S"
		validate_data['location_permission'] = "S"
		validate_data['account_permission'] = "csmr"
		validate_data['basket_permission'] = "csmr"

		validate_data['url_activation_email'] = UserManager.get_url_activation_email()

		user = User.objects.create(**validate_data)
		user.save()

		user.password = ""

		return user

class UserSerializer(ModelSerializer):
	class Meta:
		model = User
		fields = ['name', 'surname', 'phone_number','email']