from django.urls import reverse_lazy
from rest_framework.test import APITestCase

from web_page.models import Article

class TestArticle(APITestCase):

	url = reverse_lazy('get_article')

	def format_datetime(self, value):
		return value.strftime("%Y-%m-%dT%H:%M:%S.%fZ")

	def test_list(self):
		article = Article.objects.create(name="ibiuzda", principal_ingredients='iucuid', ingredients='hdiiu', description='uqoihzd',cost=7.50,masse=110,stock=0,principal_image=1,images=[1])
		Article.objects.create(name="ibiuzda", principal_ingredients='iucuid', ingredients='hdiiu', description='uqoihzd',cost=7.50,masse=110,stock=0,principal_image=1,images=[1])


		response = self. client.get(self.url)

		# On réalise l’appel en GET en utilisant le client de la classe de test
        response = self.client.get(self.url)
        # Nous vérifions que le status code est bien 200
        # et que les valeurs retournées sont bien celles attendues
        self.assertEqual(response.status_code, 200)
        excepted = [
            {
                'id': Article.pk,
                'name': Article.name,
                'date_created': self.format_datetime(Article.date_created),
                'date_updated': self.format_datetime(Article.date_updated),
            }
        ]
        self.assertEqual(excepted, response.json())

	def test_create(self):
        # Nous vérifions qu’aucune catégorie n'existe avant de tenter d’en créer une
        self.assertFalse(Article.objects.exists())
        response = self.client.post(self.url, data={'name': 'biuzuhzaohz'})
        # Vérifions que le status code est bien en erreur et nous empêche de créer une catégorie
        self.assertEqual(response.status_code, 405)
        # Enfin, vérifions qu'aucune nouvelle catégorie n’a été créée malgré le status code 405
        self.assertFalse(Article.objects.exists())