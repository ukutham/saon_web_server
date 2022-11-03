"""saon_web_server URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.conf import settings
from django.contrib import admin
from django.urls import path, include
from django.conf.urls.static import static, serve
from rest_framework import routers
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from article.views import ArticleViewset, Article_typeViewSet, ArticleOptionViewset

Article_router = routers.SimpleRouter()
Article_router.register('', ArticleViewset, basename='article')

Article_type_router = routers.SimpleRouter()
Article_type_router.register('', Article_typeViewSet, basename='article')

Article_options_router = routers.SimpleRouter()
Article_options_router.register('', ArticleOptionViewset, basename='article')

from location.views import LocationViewSet

Location_router = routers.SimpleRouter()
Location_router.register('', LocationViewSet, basename='location')

from account.views import UserViewSet

User_router = routers.SimpleRouter()
User_router.register('', UserViewSet, basename='account')

from basket.views import ProductViewset

Product_router = routers.SimpleRouter()
Product_router.register('', ProductViewset, basename='product')

from delivery_choice.views import DeliveryAddressViewset, AddressSelectViewset

Delivery_choice_router = routers.SimpleRouter()
Delivery_choice_router.register('', DeliveryAddressViewset, basename='account')

Address_select_router = routers.SimpleRouter()
Address_select_router.register('', AddressSelectViewset, basename='account')

from stripe_payment_app.views import secure_facture
from article.views import get_article_media_image

urlpatterns = [
    path('', include('web_page.urls')),
    path('', include('juridic_app.urls')),
    path('account/', include('account.urls')),
    path('admin/', include('admin_page.urls')),

    path('superadmin/', admin.site.urls),

    path('api-auth/', include('rest_framework.urls')),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    path('api/article/', include(Article_router.urls)),
    path('api/article_type/', include(Article_type_router.urls)),
    path('api/article_options/', include(Article_options_router.urls)),

    path('api/location/', include(Location_router.urls)),
    path('api/account/', include(User_router.urls)),
    path('api/product/', include(Product_router.urls)),
    path('api/delivery_choice/', include(Delivery_choice_router.urls)),
    path('delivery_choice/', include('delivery_choice.urls')),
    path('api/address_select/', include(Address_select_router.urls)),
    
    path('media/facture/<str:file>',secure_facture, name="secure_facture"),
    path('media/image/article/<str:file>', get_article_media_image),

    ############ test ###############

    path('test_payment/', include('stripe_payment_app.urls')),
]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

if settings.DEBUG:
    import debug_toolbar
    urlpatterns = [path('__debug__/', include(debug_toolbar.urls)),] + urlpatterns
