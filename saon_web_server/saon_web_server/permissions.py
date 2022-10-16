from rest_framework.permissions import BasePermission
from django.forms import model_to_dict

class AlwaysPermission(BasePermission):
	def has_permission(self, request, view):
		return True

class IsActivePermission(BasePermission):
	def has_permission(self, request, view):
		if request.user and request.user.is_authenticated:
			if request.user.is_active:
				permission = True
			else:
				permission = False
		else:
			permission = False

		return permission

class IsNotActivePermission(BasePermission):
	def has_permission(self, request, view):
		if request.user and request.user.is_authenticated:
			if request.user.is_active:
				permission = False
			else:
				permission = True
		else:
			permission = False

		return permission

class EmailActivatePermission(BasePermission):
	def has_permission(self, request, view):
		if request.user and request.user.is_authenticated:
			if request.user.email_activate:
				permission = True
			else:
				permission = False
		else:
			permission = False

		return permission


class EmailNotActivatePermission(BasePermission):
	def has_permission(self, request, view):
		if request.user and request.user.is_authenticated:
			if request.user.email_activate:
				permission = False
			else:
				permission = True
		else:
			permission = False

		return permission

"""class ProNotPermite(BasePermission):
	def has_permission(self, request, view):
		if request.user and request.user.is_authenticated and request.user.is_proffesional:
			return False
		return True"""

#########################################################################

class IsStaffUser(BasePermission):
	def has_permission(self, request, view):
		return request.user.is_staff


#########################################################################

class MyBasePermission(BasePermission):
	permission_by_viewset = {
		'location': 'location_permission',
		'article': 'article_permission',
		'article_type': 'article_permission',
		'account': 'account_permission',
		'product': 'basket_permission',
	}

	def get_permission_from_user(self, request, view):
		permission_name = self.permission_by_viewset[view.basename]
		user_permission = model_to_dict(request.user)[permission_name]

		return user_permission

#########################################################################

class DefaultPermission(MyBasePermission):
	def has_permission(self, request, view):
		if request.user and request.user.is_authenticated and request.user.email_activate:
			user_permission = self.get_permission_from_user(request, view)
			if 'a' in user_permission:
				permission = True
			else :
				permission = False
		else :
			permission = False

		return permission

class CreationPermission(MyBasePermission):
	def has_permission(self, request, view):
		if request.user and request.user.is_authenticated and request.user.email_activate:
			user_permission = self.get_permission_from_user(request, view)
			if any(x in user_permission for x in ('a', 'c')):
				permission = True
			else :
				permission = False
		else :
			permission = False

		return permission

class SeePermission(MyBasePermission):
	def has_permission(self, request, view):
		if request.user and request.user.is_authenticated and request.user.email_activate:
			user_permission = self.get_permission_from_user(request, view)
			if any(x in user_permission for x in ('a', 'S')):
				permission = True
			elif 's' in user_permission:
				if not view.get_queryset().exists():
					permission = True
				for location in view.get_queryset():
					if location.create_by != request.user:
						permission = False
						break
					permission = True

			else :
				permission = False
		else :
			permission = False

		return permission

class ModifyPermission(MyBasePermission):
	def has_permission(self, request, view):
		if request.user and request.user.is_authenticated and request.user.email_activate:
			user_permission = self.get_permission_from_user(request, view)
			if any(x in user_permission for x in ('a', 'M')):
				permission = True
			elif 'm' in user_permission:
				for location in view.get_queryset():
					if location.create_by != request.user:
						permission = False
						break
					permission = True
			else :
				permission = False
		else :
			permission = False

		return permission

class RemovePermission(MyBasePermission):
	def has_permission(self, request, view):
		if request.user and request.user.is_authenticated and request.user.email_activate:
			user_permission = self.get_permission_from_user(request, view)
			if any(x in user_permission for x in ('a', 'R')):
				permission = True
			elif 'r' in user_permission:
				print(view.get_queryset())
				for location in view.get_queryset():
					if location.create_by != request.user:
						permission = False
						break
					permission = True
			else :
				permission = False
		else :
			permission = False

		return permission

############## FOR USER ######################

class UserSeePermission(MyBasePermission):
	def has_permission(self, request, view):
		if request.user and request.user.is_authenticated and request.user.email_activate:
			user_permission = self.get_permission_from_user(request, view)
			if any(x in user_permission for x in ('a', 'S')):
				permission = True
			elif 's' in user_permission:
				for location in view.get_queryset():
					if location != request.user:
						permission = False
						break
					permission = True
			else :
				permission = False
		else :
			permission = False

		return permission

class UserModifyPermission(MyBasePermission):
	def has_permission(self, request, view):
		if request.user and request.user.is_authenticated and request.user.email_activate:
			user_permission = self.get_permission_from_user(request, view)
			if any(x in user_permission for x in ('a', 'M')):
				permission = True
			elif 'm' in user_permission:
				for location in view.get_queryset():
					if location != request.user:
						permission = False
						break
					permission = True
			else :
				permission = False
		else :
			permission = False

		return permission

class UserModifyEmailPermission(MyBasePermission):
	def has_permission(self, request, view):
		if request.user and request.user.is_authenticated:
			user_permission = self.get_permission_from_user(request, view)
			if any(x in user_permission for x in ('a', 'M')):
				permission = True
			elif 'm' in user_permission:
				for location in view.get_queryset():
					if location != request.user:
						permission = False
						break
					permission = True
			else :
				permission = False
		else :
			permission = False

		return permission

class UserRemovePermission(MyBasePermission):
	def has_permission(self, request, view):
		if request.user and request.user.is_authenticated and request.user.email_activate:
			user_permission = self.get_permission_from_user(request, view)
			if any(x in user_permission for x in ('a', 'R')):
				permission = True
			elif 'r' in user_permission:
				for location in view.get_queryset():
					if location != request.user:
						permission = False
						break
					permission = True
			else :
				permission = False
		else :
			permission = False

		return permission

#############################################################################################

from order.models import Order

class FactureViewPermission(BasePermission):
	def has_permission(self,request, view):
		if request.user.is_staff:
			return True

		facture = request.build_absolute_uri().split('/')[-1]
		print(facture)
		try:
			order = Order.objects.get(facture=f'facture/{facture}')
			print(order)

			if order.create_by == request.user:
				return True
			else:
				return False
		except:
			return False
