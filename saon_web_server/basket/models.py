from django.db import models
from article.models import Article, Article_options

from saon_web_server import settings

class Basket(models.Model):
	name = models.CharField(max_length=120, unique=True)
	create_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)

	def __str__(self):
		return self.name

class Product(models.Model):
	article = models.ForeignKey(Article, on_delete=models.CASCADE)
	number = models.IntegerField()
	basket = models.ForeignKey(Basket, on_delete=models.CASCADE)

	option = models.ForeignKey(Article_options, on_delete=models.CASCADE)
	create_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, default=1)

	def __str__(self):
		return f'{self.basket.name} : {self.article.name}'
