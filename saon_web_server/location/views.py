from rest_framework.viewsets import ReadOnlyModelViewSet, ModelViewSet
from rest_framework import serializers, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db import transaction
from geopy.geocoders import Nominatim

from .models import Location
from .serializers import LocationSerializer, CreationLocationSerializer
from saon_web_server.permissions import AlwaysPermission, DefaultPermission, CreationPermission, SeePermission, ModifyPermission, RemovePermission, IsAuthenticated

class LocationViewSet(ModelViewSet):
	
	serializer_class_by_action = {
		'default' :LocationSerializer,
		'list' :LocationSerializer,
		'retrieve' :LocationSerializer,
		'modify' :CreationLocationSerializer,
		'create' :CreationLocationSerializer,
		'remove' :CreationLocationSerializer,
	}

	permission_classes_by_action = {
		'default' :[DefaultPermission],
		'list' :[AlwaysPermission],
		'retrieve' :[AlwaysPermission],
		'modify' :[ModifyPermission],
		'create' :[CreationPermission],
		'remove' :[RemovePermission],
	}

	def get_queryset(self):
		queryset = Location.objects.filter(available=True)

		if self.action in ['list', 'retrieve']:
			location_place = self.request.GET.get('place')
			if location_place != None:
				for location in queryset:
					if location_place.lower() not in location.address.lower():
						queryset = queryset.exclude(address=location.address)

		if self.action in ['modify', 'remove']:
			queryset = queryset.filter(id=self.kwargs['pk'])

		return queryset

	############## action ################

	def create(self, request):
		data = request.data

		validate = True
		error_data = {}

		if 'name' not in data or data['name'] == '':
			validate = False
			error_data['detail'] = ["fields may not be blank."]
		if 'horaire' not in data:
			validate = False
			error_data['detail'] = ["fields may not be blank."]
		if 'web_site' not in data:
			validate = False
			error_data['detail'] = ["fields may not be blank."]
		if 'rue' not in data or data['rue'] == '':
			validate = False
			error_data['detail'] = ["fields may not be blank."]
		if 'code_postal' not in data or data['code_postal'] == '':
			validate = False
			error_data['detail'] = ["fields may not be blank."]
		else :
			try:
				data['code_postal'] = int(data['code_postal'])
			except:
				validate = False
				error_data['code_postal'] = ["Not an int"]
		if 'ville' not in data or data['ville'] == '':
			validate = False
			error_data['detail'] = ["fields may not be blank."]
		if 'pays' not in data or data['pays'] == '':
			validate = False
			error_data['detail'] = ["fields may not be blank."]

		if not validate:
			return Response(error_data, status=status.HTTP_400_BAD_REQUEST)

		try:
			geolocator = Nominatim(user_agent="saon")
			data['address'] = geolocator.geocode(f'{data["rue"]}, {data["code_postal"]} {data["ville"]}, {data["pays"]}')
		except:
			return Response({'detail': "geocode probleme, please contacting us."}, status=status.HTTP_400_BAD_REQUEST)

		if data['address'] == None:
			return Response({'detail': 'Unvalid Address'}, status=status.HTTP_400_BAD_REQUEST)

		if Location.objects.filter(address=data['address'].address.replace(',', '', 1)).exists():
			return Response({'detail': 'address already exist'}, status=status.HTTP_400_BAD_REQUEST)


		user = None
		request = self.request
		if request and hasattr(request, "user"):
			user = request.user
		else:
			user = User.objects.get(id=1)

		location = Location.objects.create(name=data['name'] ,address=data['address'].address.replace(',', '', 1), horaire=data['horaire'],web_site=data['web_site'] ,longitude=data['address'].longitude, latitude=data['address'].latitude ,create_by=user)
		location.save()

		return Response({'Object':  {'id': location.id,'name': data['name'], 'address': data['address'].address.replace(',', '', 1), 'horaire': data['horaire'],'web_site': data['web_site']}}, status=status.HTTP_200_OK)

	@transaction.atomic
	@action(detail=True, methods=['post'])
	def modify(self, request, pk):
		location = Location.objects.get(id=pk)

		for key in request.data:
			if key == "name" and request.data[key] != None and request.data[key] != '':
				location.name = request.data['name']

			if key == "horaire" and request.data[key] != None:
				location.horaire = request.data['horaire']

			if key == "web_site" and request.data[key] != None:
				location.web_site = request.data['web_site']

		location.save()

		return Response(request.data, status=status.HTTP_200_OK)

	@transaction.atomic
	@action(detail=True, methods=['delete'])
	def remove(self, request, pk):
		try:
			location = Location.objects.get(id=pk)

			location.delete()
		except:
			return Response({'detail': f'object {pk} don\'t exist '}, status=status.HTTP_400_BAD_REQUEST)

		return Response({f'Object {pk}': 'remove'}, status=status.HTTP_200_OK)

	################ get global varial #################

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