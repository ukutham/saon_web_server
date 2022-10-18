from django.db import models, transaction
from account.models import User
from saon_web_server import settings

def directory_principal_image(instance, filename):
	return f'image/article/article_{instance.id}_principal_image'

def directory_image_1(instance, filename):
	return f'image/article/article_{instance.id}_image_1'

def directory_image_2(instance, filename):
	return f'image/article/article_{instance.id}_image_2'

def directory_image_3(instance, filename):
	return f'image/article/article_{instance.id}_image_3'


class Article_type(models.Model):
	id = models.BigAutoField(primary_key=True)
	name = models.CharField(max_length=100, unique=True)
	creation_date = models.DateField(auto_now_add=True)

	activate = models.BooleanField(default=True)
	create_by = models.ForeignKey(settings.AUTH_USER_MODEL, default=1, on_delete=models.SET_DEFAULT)

	def __str__(self):
		return self.name

	@transaction.atomic
	def activate_deactivate(self):
		if self.activate is False:
			self.activate = True
			self.articles.update(available=True)
		else:
			self.activate = False
			self.articles.update(available=False)
		self.save()

class Article(models.Model):
	id = models.BigAutoField(primary_key=True)
	name = models.CharField(max_length=100, unique=True)
	principal_ingredients = models.CharField(max_length=200)
	ingredients = models.TextField()
	description = models.TextField()

	principal_image = models.ImageField(upload_to=directory_principal_image)
	image_1 = models.ImageField(upload_to=directory_image_1)
	image_2 = models.ImageField(upload_to=directory_image_2)
	image_3 = models.ImageField(upload_to=directory_image_3)

	article_type = models.ForeignKey(Article_type, on_delete=models.CASCADE)
	
	available = models.BooleanField(default=True)
	creation_date = models.DateField(auto_now_add=True)
	create_by = models.ForeignKey(settings.AUTH_USER_MODEL, default=1, on_delete=models.SET_DEFAULT)

	def __str__(self):
		return self.name

class Article_options(models.Model):
	id = models.BigAutoField(primary_key=True)
	view_name = models.CharField(max_length=100)
	cost = models.DecimalField(decimal_places=2, max_digits=5)
	masse = models.IntegerField()
	stock = models.IntegerField(default=0)
	importance = models.IntegerField(default=0)

	article = models.ForeignKey(Article, default=1, on_delete=models.CASCADE)

	create_by = models.ForeignKey(settings.AUTH_USER_MODEL, default=1, on_delete=models.SET_DEFAULT)

	def __str__(self):
		return f'{self.view_name}'