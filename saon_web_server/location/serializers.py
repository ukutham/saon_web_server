from rest_framework import serializers
from rest_framework.serializers import ModelSerializer
from geopy.geocoders import Nominatim

from .models import Location
from account.models import User

class LocationSerializer(ModelSerializer):
	class Meta:
		model = Location
		fields = ['longitude', 'latitude', 'name', 'horaire','address', 'web_site', 'id']

class CreationLocationSerializer(ModelSerializer):
	class Meta:
		model = Location
		fields = ['name', 'horaire', 'web_site']