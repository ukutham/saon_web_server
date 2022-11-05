from django.db import models
from article.models import Article, Article_options

from saon_web_server import settings

def directory_facture_url(instance, filename):
	return f'facture/{instance.id}'

class Order(models.Model):
	LIVRAISON_MODE_CHOICE = (
		('C', 'Colissimo'),
		('M', 'Mondial Relay'),
	)
	STATE_OPTION = (
		('0', 'en cours de préparation'),
		('1', 'livré à l\' expéditeur'),
	)

	id = models.BigAutoField(primary_key=True)
	stripe_session_id = models.CharField(max_length=200, unique=True)

	name = models.CharField(max_length=100)
	surname = models.CharField(max_length=100)
	email = models.EmailField(max_length=50)

	address = models.CharField(max_length=1000)
	relay_id = models.CharField(max_length=30, default=None, null=True)
	cost_TTC = models.DecimalField(decimal_places=2, max_digits=10)
	livraison_mode = models.CharField(max_length=1, choices=LIVRAISON_MODE_CHOICE)
	state = models.CharField(max_length=1, choices=STATE_OPTION)
	facture = models.FileField(upload_to=directory_facture_url, null=True)
	facture_id = models.CharField(max_length=200, default='FI0')
	creation_date = models.DateField(auto_now_add=True)
	create_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT)

	def __str__(self):
		return f'order of {self.create_by}; state: {self.state}'

class ProductOrder(models.Model):
	article_name = models.CharField(max_length=100)
	number = models.IntegerField()
	cost = models.DecimalField(decimal_places=2, max_digits=5)
	option_name = models.CharField(max_length=100)

	order = models.ForeignKey(Order, on_delete=models.CASCADE)
	create_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT)


class LivraisonCost(models.Model):
	LIVRAISON_MODE_CHOICE = (
		('C', 'Colissimo'),
		('M', 'Mondial Relay'),
	)
	country = models.CharField(max_length=3, default='FRA')
	masse = models.DecimalField(decimal_places=2, max_digits=5)
	cost = models.DecimalField(decimal_places=2, max_digits=10)
	livraison_mode = models.CharField(max_length=1, choices=LIVRAISON_MODE_CHOICE)
	carton_cost = models.DecimalField(decimal_places=2, max_digits=5, default=0.50)

	def __str__(self):
		return f'{self.livraison_mode} : {self.masse}kg = {self.cost}€ + {self.carton_cost}€'


def get_livraison_price_by_masse(masse, livraison_mode):
	masse_list = []
	queryset = LivraisonCost.objects.filter(livraison_mode=livraison_mode)
	for livraison_cost in queryset:
		masse_list.append(float(livraison_cost.masse))

	near_masse = masse_list[min(range(len(masse_list)), key = lambda i: abs(masse_list[i]-masse))]

	return queryset.get(masse=near_masse)
