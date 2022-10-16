from rest_framework.viewsets import ModelViewSet
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db import transaction
from rest_framework import serializers, status
from django.shortcuts import render
from django.template import loader
from django.http import HttpResponse

from rest_framework.permissions import IsAuthenticated
from time import sleep

from geopy.geocoders import Nominatim

from .models import delivery_address, AddressSelect
from .serializers import DeliveryAddressSerializer, AddressSelectSerializer
from saon_web_server.permissions import AlwaysPermission, DefaultPermission, CreationPermission, SeePermission, ModifyPermission, RemovePermission

def delivery_choice_page(request):
	template = loader.get_template('delivery_choice/delivery_choice.html')

	return HttpResponse(template.render(request=request))

class DeliveryAddressViewset(ModelViewSet):

	serializer_class_by_action = {
		'default' :DeliveryAddressSerializer,
		'list' :DeliveryAddressSerializer,
		'retrieve' :DeliveryAddressSerializer,
		'create' :DeliveryAddressSerializer,
		'remove' :DeliveryAddressSerializer,
	}

	permission_classes_by_action = {
		'default' :[DefaultPermission],
		'list' :[SeePermission],
		'retrieve' :[SeePermission],
		'create' :[CreationPermission],
		'remove' :[RemovePermission],
	}

	def get_queryset(self):
		queryset = delivery_address.objects.all()

		if self.action == 'list':
			queryset = queryset.filter(create_by=self.request.user)
		elif self.action == 'retrieve' or self.action == 'remove':
			queryset = queryset.filter(id=self.kwargs['pk'])

		return queryset

	def create(self, request):
		split_rue = []
		for i in request.data["rue"].split():
			if i.isdigit():
				split_rue.append(i)
			else:
				for letter in i:
					if letter.isdigit():
						split_rue.append(letter)
				
		if not split_rue:
			raise serializers.ValidationError({f'details': 'aucun numero de rue'})

		try:
			geolocator = Nominatim(user_agent="saon")
			new_address = geolocator.geocode(f'{request.data["rue"]}, {request.data["ville"]}, {request.data["pays"]}')
		except:
			raise serializers.ValidationError({f'details': 'invalid request'})

		if new_address == None:
			raise serializers.ValidationError({f'details': 'coordonnée non correcte'})

		if delivery_address.objects.all().filter(create_by=request.user).filter(delivery_address=new_address).exists():
			raise serializers.ValidationError({f'details': 'adresse deja enregistre'})

		address = delivery_address.objects.create(delivery_address=new_address, create_by=request.user)
		address.save()

		return Response({'details': 'success', 'new_address': new_address.address, 'id': address.id}, status=status.HTTP_200_OK)

	@transaction.atomic
	@action(detail=True, methods=['delete'])
	def remove(self, request, pk):
		try:
			address = delivery_address.objects.get(id=pk)

			address.delete()
		except:
			return Response({'detail': f'object {pk} don\'t exist '}, status=status.HTTP_400_BAD_REQUEST)

		return Response({f'Object': 'remove'}, status=status.HTTP_200_OK)


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



class AddressSelectViewset(ModelViewSet):

	serializer_class_by_action = {
		'default' :AddressSelectSerializer,
		'list' :AddressSelectSerializer,
		'retrieve' :AddressSelectSerializer,
		'create' :AddressSelectSerializer,
		'remove' :AddressSelectSerializer,
	}

	permission_classes_by_action = {
		'default' :[DefaultPermission],
		'list' :[SeePermission],
		'retrieve' :[SeePermission],
		'create' :[CreationPermission],
		'remove' :[RemovePermission],
	}

	def get_queryset(self):
		queryset = AddressSelect.objects.all()

		if self.action == 'list':
			queryset = queryset.filter(create_by=self.request.user)
		elif self.action == 'retrieve' or self.action == 'remove':
			queryset = queryset.filter(id=self.kwargs['pk'])

		return queryset

	def create(self, request):
		if 'livraison_mode' not in request.data:
			raise serializers.ValidationError({f'details': 'livraison_mode missing'})
		if 'relay_id' not in request.data:
			raise serializers.ValidationError({f'details': 'relay_id missing'})
		if request.data['livraison_mode'] not in ['colissimo', 'mondial relay']:
			raise serializers.ValidationError({f'details': 'livraison_mode haven\'t a good value'})

		if request.data['livraison_mode'] == 'colissimo':
			try:
				geolocator = Nominatim(user_agent="saon")
				new_address = geolocator.geocode(request.data['address'])
			except:
				raise serializers.ValidationError({f'details': 'invalid request'})
		elif request.data['livraison_mode'] == 'mondial relay':
			try:
				geolocator = Nominatim(user_agent="saon")
				new_address = geolocator.reverse(request.data['coord'])
			except:
				raise serializers.ValidationError({f'details': 'invalid request'})

		if new_address == None:
			raise serializers.ValidationError({f'details': 'coordonnée non correcte'})

		if ' France métropolitaine' not in new_address.address.split(','):
			raise serializers.ValidationError({f'details': 'veuillez selectionner une adresse en france métropolitaine'})

		if AddressSelect.objects.filter(create_by=request.user).exists():
			AddressSelect.objects.filter(create_by=request.user).delete()
	
		address = AddressSelect.objects.create(livraison_mode=request.data['livraison_mode'], address=new_address, relay_id=request.data['relay_id'], create_by=request.user)
		address.save()

		return Response({'details': 'success', 'address': new_address.address, 'id': address.id, 'livraison_mode': address.livraison_mode}, status=status.HTTP_200_OK)

	@transaction.atomic
	@action(detail=True, methods=['delete'])
	def remove(self, request, pk):
		try:
			address = AddressSelect.objects.get(id=pk)

			address.delete()
		except:
			return Response({'detail': f'object {pk} don\'t exist '}, status=status.HTTP_400_BAD_REQUEST)

		return Response({f'Object': 'remove'}, status=status.HTTP_200_OK)


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