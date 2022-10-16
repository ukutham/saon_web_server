from rest_framework import serializers
from rest_framework.serializers import ModelSerializer

from .models import Basket, Product
from account.serializers import UserSerializer
from article.serializers import ArticleListSerializer, ArticleOptionsSerializer

class BasketSerializer(ModelSerializer):

	create_by = UserSerializer()

	class Meta:
		model = Basket
		fields = ['name', 'create_by']


class ProductSerializer(ModelSerializer):

	basket = BasketSerializer()
	article = ArticleListSerializer()
	option = ArticleOptionsSerializer()

	class Meta:
		model = Product
		fields = ['article', 'basket', 'number', 'option']