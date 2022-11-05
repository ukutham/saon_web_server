from django.db import models, transaction
from geopy.geocoders import Nominatim

from account.models import User
from saon_web_server import settings

class Location(models.Model):
	longitude = models.DecimalField(decimal_places=8, max_digits=10)
	latitude = models.DecimalField(decimal_places=8, max_digits=10)
	name = models.CharField(max_length=200)
	horaire = models.CharField(max_length=200, default='')
	address = models.CharField(max_length=400, unique=True)
	web_site = models.CharField(max_length=300, default='')
	available = models.BooleanField(default=True)
	create_by = models.ForeignKey(settings.AUTH_USER_MODEL, default=1, on_delete=models.CASCADE)

	def __str__(self):
		return f'{self.name} : {self.get_place()}'

	def get_place(self):
		return f'{self.address}'