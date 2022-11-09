from rest_framework.viewsets import ModelViewSet
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db import transaction
from rest_framework import serializers, status
from django.core.serializers import json

from time import sleep

from .models import Basket, Product
from .serializers import BasketSerializer, ProductSerializer
from saon_web_server.permissions import AlwaysPermission, DefaultPermission, CreationPermission, SeePermission, ModifyPermission, RemovePermission, IsAuthenticated

class ProductViewset(ModelViewSet):

	serializer_class_by_action = {
		'default' :ProductSerializer,
		'list' :ProductSerializer,
		'retrieve' :ProductSerializer,
		'create' :ProductSerializer,
		'add' :ProductSerializer,
		'remove' :ProductSerializer,
	}

	permission_classes_by_action = {
		'default' :[DefaultPermission],
		'list' :[SeePermission],
		'retrieve' :[SeePermission],
		'create' :[CreationPermission],
		'add' :[ModifyPermission],
		'remove' :[RemovePermission],
	}

	def get_queryset(self):

		queryset = Product.objects.all()

		if self.action == 'list':
			return queryset.filter(basket=Basket.objects.get(create_by=self.request.user))
		elif self.action in ['retrieve','add', 'remove']:
			queryset = queryset.filter(id=self.kwargs['pk'])

		return queryset

	@transaction.atomic
	@action(detail=True, methods=['post'])
	def add(self, request, pk):
		try:
			product = Product.objects.get(id=pk)

			if 'new_number' not in request.data:
				return Response({'detail': f'new_number not define'}, status=status.HTTP_400_BAD_REQUEST)

			if isinstance(request.data['new_number'], int):
				return Response({'detail': f'new_number is not an int'}, status=status.HTTP_400_BAD_REQUEST)

			new_number = int(request.data['new_number'])

			if product.option.stock < new_number or new_number < 1:
				if product.option.stock < 1:
					product.delete()
				return Response({'detail': f'number invalide value', 'stock': product.option.stock}, status=status.HTTP_400_BAD_REQUEST)

			product.number = new_number
			product.save()

		except:
			return Response({'detail': f'object {pk} don\'t exist '}, status=status.HTTP_400_BAD_REQUEST)

		return Response({f'Object {pk}': 'add'}, status=status.HTTP_200_OK)


	@transaction.atomic
	@action(detail=True, methods=['delete'])
	def remove(self, request, pk):
		try:
			article = Product.objects.get(id=pk)

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