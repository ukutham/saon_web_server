from django.urls import path

from . import views

urlpatterns = [
	path('mail_send_page', views.mail_send_page),
	path('<int:url_activation_email>', views.validation_page),
	path('change_email', views.change_email),
	path('password_forgot', views.set_url_password_forgot),
	path('change_password_page/<int:url_password_forgot>', views.change_password_page)
]
