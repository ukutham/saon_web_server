from django.contrib import admin
from .models import Order, ProductOrder, LivraisonCost

admin.site.register(Order)
admin.site.register(ProductOrder)
admin.site.register(LivraisonCost)
