from django.urls import path

from . import views

urlpatterns = [
	path('', views.nav_bar),

	path('location_admin/', views.location_admin),

	path('article/', views.article),

	path('order/', views.order),
	path('order/<int:order_id>/change_state/', views.change_order_status),

	path('account_admin/', views.account_admin),
	path('account_admin/search_account/', views.search_account),

	path('comptability/', views.comptability),
	path('comptability/get_facture/<str:date>/', views.get_facture),
]