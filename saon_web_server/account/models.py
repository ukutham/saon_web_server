from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager
from django.contrib.auth.models import PermissionsMixin

import random
import string

URL_LENGHT = 100

class UserManager(BaseUserManager):
	use_in_migration = True

	@classmethod
	def get_url_activation_email(self):
		output_string = ''.join(random.SystemRandom().choice(string.ascii_letters + string.digits) for _ in range(URL_LENGHT))

		return output_string

	@classmethod
	def get_url_password_forgot(self):
		output_string = ''.join(random.SystemRandom().choice(string.ascii_letters + string.digits) for _ in range(URL_LENGHT))

		return output_string

	def save_user(self, email, password, **extra_fields):
		extra_fields['url_activation_email'] = str(0)
		extra_fields['url_password_forgot'] = str(0)

		if not email:
			raise('The given email must be set')

		email = self.normalize_email(email)
		user = self.model(email=email, **extra_fields)

		user.set_password(password)
		user.save(using=self._db)

		return user

	def create_superuser(self, email, password, **extra_fields):
		extra_fields['web_page_permission'] = 'a'
		extra_fields['article_permission'] = 'a'
		extra_fields['location_permission'] = 'a'
		extra_fields['account_permission'] = 'a'
		extra_fields['basket_permission'] = 'a'
	
		extra_fields['is_staff'] = True
		extra_fields['is_superuser'] = True
		extra_fields['email_activate'] = True

		return self.save_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
	id = models.BigAutoField(primary_key=True)
	name = models.CharField(max_length=100)
	surname = models.CharField(max_length=100)
	phone_number = models.CharField(max_length=20)
	email = models.EmailField(max_length = 50, unique=True)
	#siren = models.CharField(max_length = 50, default=None, null=True)

	#is_proffesional = models.BooleanField(default=False)
	is_staff = models.BooleanField(default=False)
	is_superuser = models.BooleanField(default=False)

	is_active = models.BooleanField(default=True)
	email_activate = models.BooleanField(default=False)
	url_activation_email = models.CharField(max_length=URL_LENGHT)

	url_password_forgot = models.CharField(max_length=URL_LENGHT, default=0)

	##########################################
	""" Permission code """
	"""
		a : all permission
		c : create
		s : see what you create
		S : see all
		m : modify what you create
		M : modify all
		r : remove what you create
		R : remove all
	"""
	"""                 """
	##########################################

	web_page_permission = models.CharField(max_length=4)
	article_permission = models.CharField(max_length=4)
	location_permission = models.CharField(max_length=4)
	account_permission = models.CharField(max_length=4, default='csmr')
	basket_permission = models.CharField(max_length=4, default='csmr')

	USERNAME_FIELD = 'email'

	objects = UserManager()



