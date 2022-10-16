from django.urls import path

from . import views

urlpatterns = [
	path('', views.go_to_payment_page),
	path('success/', views.payment_success)
]