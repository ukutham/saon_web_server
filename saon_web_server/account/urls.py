from django.urls import path

from . import views

urlpatterns = [
	path('mail_send_page', views.mail_send_page),
	path('<str:url_activation_email>', views.validation_page),

	path('change_password_page/<str:url_password_forgot>', views.change_password_page),
	path('change_forgot_password/<str:url_password_forgot>', views.change_forgot_password)
]
