from django.db import models

from saon_web_server import settings

class delivery_address(models.Model):
	id = models.BigAutoField(primary_key=True)
	delivery_address = models.CharField(max_length=200, default=None, null=True)
	create_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)

	def __str__(self):
		return f'{self.create_by.email} : {self.delivery_address}'

class AddressSelect(models.Model):
	id = models.BigAutoField(primary_key=True)
	livraison_mode = models.CharField(max_length=50, default=None, null=True)
	address = models.CharField(max_length=200, default=None, null=True)
	relay_id = models.CharField(max_length=30, default=None, null=True)
	create_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)

	def __str__(self):
		return f'{self.create_by.email} : {self.livraison_mode} , {self.address}'