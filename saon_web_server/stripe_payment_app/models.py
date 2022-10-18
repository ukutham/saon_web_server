from django.db import models

from saon_web_server import settings

class StripeMetaData(models.Model):
	stripe_session_id = models.CharField(max_length=200, unique=True)
	metadata = models.CharField(max_length=10000)

