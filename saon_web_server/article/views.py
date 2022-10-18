from rest_framework.viewsets import ModelViewSet, ReadOnlyModelViewSet
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db import transaction
from rest_framework import serializers, status
from rest_framework.decorators import api_view, permission_classes
from django.http import FileResponse
from saon_web_server import settings

from rest_framework.permissions import IsAuthenticated

from basket.models import Product, Basket
from .models import Article, Article_type, Article_options
from .serializers import ArticleListSerializer, ArticleDetailSerializer, Article_typeSerializer, ArticleOptionsSerializer
from saon_web_server.permissions import AlwaysPermission, DefaultPermission, CreationPermission, SeePermission, ModifyPermission, RemovePermission

class ArticleViewset(ModelViewSet):

	serializer_class_by_action = {
		'default' :ArticleListSerializer,
		'list' :ArticleListSerializer,
		'retrieve' :ArticleDetailSerializer,
		'modify' :ArticleDetailSerializer,
		'add_in_basket' :ArticleDetailSerializer,
		'create' :ArticleDetailSerializer,
		'remove' :ArticleDetailSerializer,
	}

	permission_classes_by_action = {
		'default' :[DefaultPermission],
		'list' :[AlwaysPermission],
		'retrieve' :[AlwaysPermission],
		'modify' :[ModifyPermission],
		'add_in_basket' :[IsAuthenticated],
		'create' :[CreationPermission],
		'remove' :[RemovePermission],
	}

	def get_queryset(self):

		if self.request.user.is_staff:
			queryset = Article.objects.all()
		else :
			queryset = Article.objects.filter(available=True)

		article_name = self.request.GET.get('name')
		if self.action == 'list':
			if article_name is not None:
				self.action = 'retrieve'
				queryset = queryset.filter(name=article_name)
		elif self.action in ['retrieve', 'add_in_basket', 'remove']:
			queryset = queryset.filter(id=self.kwargs['pk'])

		return queryset.order_by('name')

	def retrieve(self, request, *args, **kwargs):
		response = super().retrieve(request, *args, **kwargs)

		response.data['options'] = {'options': {}}

		i = 0
		for option in Article_options.objects.filter(article=Article.objects.get(name=response.data['name'])).order_by('importance'):
			response.data['options']['options'][i] = {
				'id': option.id,
				'view_name': option.view_name,
				'cost': option.cost,
				'masse': option.masse,
				'stock': option.stock,
				'importance': option.importance,
			}
			i+=1

		return response

	@transaction.atomic
	@action(detail=True, methods=['get'])
	def retrieve_unvailable_article(self, request, pk):
		return self.retrieve(self, request, pk)

	@transaction.atomic
	@action(detail=True, methods=['post'])
	def modify(self, request, pk):
		article = Article.objects.get(id=pk)

		if 'name' in request.data and request.data['name'] != '':
			article.name = request.data['name']
		if 'principal_ingredients' in request.data and request.data['principal_ingredients'] != '':
			article.principal_ingredients = request.data['principal_ingredients']
		if 'ingredients' in request.data and request.data['ingredients'] != '':
			article.ingredients = request.data['ingredients']
		if 'description' in request.data and request.data['description'] != '':
			article.description = request.data['description']

		if 'principal_image' in request.data:
			article.principal_image = request.data['principal_image']
		if 'image_1' in request.data:
			article.image_1 = request.data['image_1']
		if 'image_2' in request.data:
			article.image_2 = request.data['image_2']
		if 'image_3' in request.data:
			article.image_3 = request.data['image_3']

		try:
			if 'article_type' in request.data and request.data['article_type'] != '' and Article_type.objects.filter(id=int(request.data['article_type'])).exists():
				article.article_type = Article_type.objects.filter(id=int(request.data['article_type']))[0]
			if 'available' in request.data and request.data['available'] != '':
				if Article_options.objects.filter(article=article).exists():
					article.available = bool(request.data['available'])
				else:
					article.available = False
		except:
			return Response({f'detail': 'use number fucking moron'}, status=status.HTTP_400_BAD_REQUEST)

		article.save()



		return Response({f'Modification': 'ok'}, status=status.HTTP_200_OK)


	@transaction.atomic
	@action(detail=True, methods=['post'])
	def add_in_basket(self, request, pk):
		if 'option_id' not in request.data or 'number' not in request.data:
			return Response(status=400)

		if not Article_options.objects.filter(id=request.data['option_id']).exists():
			return Response(data={'error': 'option non valide'},status=400)

		article = Article.objects.get(id=pk)
		option = Article_options.objects.get(id=request.data['option_id'])

		try :
			if int(request.data['number']) > option.stock:
				return Response(data={'error': 'pas assez de stock'},status=400)
		except :
			return Response(data={'error': 'nombre non valide'},status=400)

		if option not in Article_options.objects.filter(article=article):
			return Response(data={'error': 'option non valide'},status=400)

		#############################

		if not Basket.objects.filter(create_by=request.user).exists():
			user_basket_data = {}
			user_basket_data['name'] = f'{request.user}_basket'
			user_basket_data['create_by'] = request.user
			user_basket = Basket.objects.create(**user_basket_data)
		else :
			user_basket = Basket.objects.get(create_by=request.user)

		product_queryset = Product.objects.filter(basket=user_basket)

		if product_queryset.filter(article=article).exists():
			product_article_queryset = product_queryset.filter(article=article)
			if product_article_queryset.filter(option=option).exists():
				old_porduct = product_article_queryset.get(option=option)

				if old_porduct.number + int(request.data['number']) > option.stock:
					return Response(data={'error': 'votre commande dépasse les stock disponibles'},status=400)

				old_porduct.number += int(request.data['number'])
				old_porduct.save()

			else :
				data = {}
				data['option'] = option
				data['number'] = request.data['number']
				data['article'] = article
				data['basket'] = user_basket
				data['create_by'] = request.user

				product = Product.objects.create(**data)
				product.save()

		else :
			data = {}
			data['option'] = option
			data['number'] = request.data['number']
			data['article'] = article
			data['basket'] = user_basket
			data['create_by'] = request.user

			product = Product.objects.create(**data)
			product.save()

		return Response(data={"status": 'ok'})

	@transaction.atomic
	@action(detail=True, methods=['delete'])
	def remove(self, request, pk):
		try:
			article = Article.objects.get(id=pk)

			article.delete()
		except:
			return Response({'detail': f'object {pk} don\'t exist '}, status=status.HTTP_400_BAD_REQUEST)

		return Response({f'Object {pk}': 'remove'}, status=status.HTTP_200_OK)


	def get_permissions(self):
		try:
			return [permission() for permission in self.permission_classes_by_action[self.action]]
		except KeyError:
			return [permission() for permission in self.permission_classes_by_action['default']]

	def get_serializer_class(self):
		try:
			return self.serializer_class_by_action[self.action]
		except KeyError:
			return self.serializer_class_by_action['default']


class ArticleOptionViewset(ModelViewSet):

	serializer_class_by_action = {
		'default' :ArticleOptionsSerializer,
		'list' :ArticleOptionsSerializer,
		'retrieve' :ArticleOptionsSerializer,
		'create' :ArticleOptionsSerializer,
		'modify' :ArticleOptionsSerializer,
		'remove' :ArticleOptionsSerializer,
	}

	permission_classes_by_action = {
		'default' :[DefaultPermission],
		'list' :[SeePermission],
		'retrieve' :[SeePermission],
		'create' :[CreationPermission],
		'modify' :[ModifyPermission],
		'remove' :[RemovePermission],
	}

	def get_queryset(self):
		queryset = Article_options.objects.all()

		if self.action == 'list':
			article_option_name = self.request.GET.get('name')
			if article_option_name is not None:
				self.action = 'retrieve'
				queryset = queryset.filter(name=article_option_name)
		if self.action in ['retrieve', 'add_in_basket', 'remove']:
			queryset = queryset.filter(id=self.kwargs['pk'])
		
		return queryset.order_by('view_name')

	@transaction.atomic
	@action(detail=True, methods=['post'])
	def modify(self, request, pk):
		test_queryset = Article_options.objects.filter(article=request.data['article'] ,view_name=request.data['view_name']).exclude(id=pk)
		if test_queryset.exists():
			return Response({f'detail': 'nom déjà utilisé'}, status=status.HTTP_400_BAD_REQUEST)

		article_option = Article_options.objects.get(id=pk)

		if 'view_name' in request.data and request.data['view_name'] != '':
			article_option.view_name = request.data['view_name']

		try:
			if 'cost' in request.data or request.data['cost'] != '':
				article_option.cost = float(request.data['cost'])
			if 'masse' in request.data or request.data['masse'] != '':
				article_option.masse = int(request.data['masse'])
			if 'stock' in request.data or request.data['stock'] != '':
				article_option.stock = int(request.data['stock'])
			if 'importance' in request.data or request.data['importance'] != '':
				article_option.importance = int(request.data['importance'])
		except:
			return Response({f'detail': 'use number fucking moron'}, status=status.HTTP_400_BAD_REQUEST)

		article_option.save()

		return Response({f'Modification': 'ok'}, status=status.HTTP_200_OK)


	@transaction.atomic
	@action(detail=True, methods=['delete'])
	def remove(self, request, pk):
		try:
			article_options = Article_options.objects.get(id=pk)
			article = article_options.article
			article_options.delete()

			if not Article_options.objects.filter(article=article).exists():
				article.available = False
				article.save()

		except:
			return Response({'detail': f'object {pk} don\'t exist '}, status=status.HTTP_400_BAD_REQUEST)

		return Response({f'Object {pk}': 'remove'}, status=status.HTTP_200_OK)


	def get_permissions(self):
		try:
			return [permission() for permission in self.permission_classes_by_action[self.action]]
		except KeyError:
			return [permission() for permission in self.permission_classes_by_action['default']]

	def get_serializer_class(self):
		try:
			return self.serializer_class_by_action[self.action]
		except KeyError:
			return self.serializer_class_by_action['default']



class Article_typeViewSet(ModelViewSet):

	serializer_class_by_action = {
		'default' :Article_typeSerializer,
		'list' :Article_typeSerializer,
		'retrieve' :Article_typeSerializer,
		'activate_deactivate' :Article_typeSerializer,
		'create' :Article_typeSerializer,
		'remove' :Article_typeSerializer,
	}

	permission_classes_by_action = {
		'default' :[DefaultPermission],
		'list' :[SeePermission],
		'retrieve' :[SeePermission],
		'modify_name' :[ModifyPermission],
		'activate_deactivate' :[ModifyPermission],
		'create' :[CreationPermission],
		'remove' :[RemovePermission],
	}

	def get_queryset(self):
		queryset = Article_type.objects.all()

		if self.action == 'list':
			article_name = self.request.GET.get('name')
			if article_name is not None:
				self.action = 'retrieve'
				queryset = queryset.filter(name=article_name)
		elif self.action in ['retrieve', 'add_in_basket', 'remove']:
			queryset = queryset.filter(id=self.kwargs['pk'])
		
		return queryset.order_by('name')

	@action(detail=True, methods=['post'])
	def modify_name(self, request, pk):
		if 'new_name' not in request.data:
			return Response(status=400)
		if Article_type.objects.filter(name=request.data['new_name']).exists():
			return Response(data={'error': 'nouveau nom deja utilisé'},status=400)

		article_type = Article_type.objects.get(pk=pk)
		article_type.name = request.data['new_name']
		article_type.save()

		return Response({"Modification": 'ok'})

	@action(detail=True, methods=['post'])
	def activate_deactivate(self, request, pk):
		self.get_object().activate_deactivate()
		return Response()

	@transaction.atomic
	@action(detail=True, methods=['delete'])
	def remove(self, request, pk):
		try:
			article_type = Article_type.objects.get(id=pk)

			article_type.delete()
		except:
			return Response({'detail': f'object {pk} don\'t exist '}, status=status.HTTP_400_BAD_REQUEST)

		return Response({f'Object {pk}': 'remove'}, status=status.HTTP_200_OK)


	def get_permissions(self):
		try:
			return [permission() for permission in self.permission_classes_by_action[self.action]]
		except KeyError:
			return [permission() for permission in self.permission_classes_by_action['default']]

	def get_serializer_class(self):
		try:
			return self.serializer_class_by_action[self.action]
		except KeyError:
			return self.serializer_class_by_action['default']


@api_view(['GET'])
@permission_classes([AlwaysPermission])
def get_article_media_image(request, file):
	print(f'{settings.MEDIA_ROOT}/image/article/{file}')
	try:
		response = FileResponse(open(f'{settings.MEDIA_ROOT}/image/article/{file}', 'rb'))
	except:
		return Response(status=status.HTTP_404_NOT_FOUND)

	return response
