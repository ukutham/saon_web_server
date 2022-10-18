from rest_framework import serializers
from rest_framework.serializers import ModelSerializer

from .models import Article, Article_type, Article_options

class ArticleListSerializer(ModelSerializer):
	class Meta:
		model = Article
		fields = ['name', 'principal_ingredients', 'principal_image']

	def validate_name(self, value):
		if Article.objects.filter(name=value).exists():
			raise serializers.ValidationError('nom déjà utilisé')

		return value

	def create(self, validate_data):
		user = None
		request = self.context.get('request')
		if request and hasattr(request, "user"):
			user = request.user
		else:
			user = User.objects.get(id=1)

		article = Article.objects.create(**validate_data, create_by=user)
		article.save()

		return article

class ArticleDetailSerializer(ModelSerializer):
	class Meta:
		model = Article
		fields = ['id', 'article_type' ,'name', 'principal_ingredients', 'ingredients', 'description','principal_image', 'image_1', 'image_2', 'image_3', 'available']

	def validate_name(self, value):
		if Article.objects.filter(name=value).exists():
			raise serializers.ValidationError('nom déjà utilisé')
		return value

	def create(self, validate_data):
		validate_data['available'] = False
		user = None
		request = self.context.get('request')
		if request and hasattr(request, "user"):
			user = request.user
		else:
			user = User.objects.get(id=1)

		article = Article.objects.create(**validate_data, create_by=user)
		article.save()

		return article

class ArticleOptionsSerializer(ModelSerializer):
	class Meta:
		model = Article_options
		fields = ['view_name', 'cost', 'masse', 'stock', 'importance', 'article', 'id']

	def validate(self, validate_data):
		print(Article_options.objects.filter(article=validate_data['article'] ,view_name=validate_data['view_name']))
		if Article_options.objects.filter(article=validate_data['article'] ,view_name=validate_data['view_name']).exists():
			raise serializers.ValidationError('nom déjà utilisé')
		return validate_data

	def create(self, validate_data):
		print(validate_data)
		user = None
		request = self.context.get('request')
		if request and hasattr(request, "user"):
			user = request.user
		else:
			user = User.objects.get(id=1)

		article_options = Article_options.objects.create(**validate_data, create_by=user)
		article_options.save()


		return article_options

class Article_typeSerializer(ModelSerializer):
	class Meta:
		model = Article_type
		fields = ['name']

	def validate_name(self, value):
		if Article_type.objects.filter(name=value).exists():
			raise serializers.ValidationError('nom déjà utilisé')
		return value

	def create(self, validate_data):
		user = None
		request = self.context.get('request')
		if request and hasattr(request, "user"):
			user = request.user
		else:
			user = User.objects.get(id=1)

		article_type = Article_type.objects.create(**validate_data, create_by=user)
		article_type.save()

		return article_type
