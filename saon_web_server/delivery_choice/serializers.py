from rest_framework import serializers
from rest_framework.serializers import ModelSerializer

from .models import delivery_address, AddressSelect
from account.serializers import UserSerializer
from account.models import User

class DeliveryAddressSerializer(ModelSerializer):
	class Meta:
		model = delivery_address
		fields = ['delivery_address', 'id']

class AddressSelectSerializer(ModelSerializer):
	class Meta:
		model = AddressSelect
		fields = ['id', 'livraison_mode', 'address']