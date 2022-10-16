from django.urls import path

from . import views

urlpatterns = [
	path('', views.nav_bar),
	path('test_token', views.test_token),
	path('menu', views.menu),
	path('location', views.location),
	path('soap', views.soap),
	path('basket', views.basket),
	path('delivery_choice', views.delivery_choice),
	path('account', views.account),
	path('password_forgot', views.password_forgot),
]