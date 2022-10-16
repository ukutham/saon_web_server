from django.contrib import admin

from .models import *

admin.site.register(Article)
admin.site.register(Article_type)
admin.site.register(Article_options)