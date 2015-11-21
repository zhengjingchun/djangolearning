__author__ = 'zhengjingchun'

from django.conf.urls import patterns, include, url
from views import articles

urlpatterns = patterns("",
                       url(r"^$", articles),
                       )