__author__ = 'zhengjingchun'

from django.conf.urls import patterns, include, url
from views import myDemo

urlpatterns = patterns("",
                       url(r"^$", myDemo),
                       )