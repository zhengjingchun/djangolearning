__author__ = 'zhengjingchun'


from django.shortcuts import render_to_response
import datetime

def myDemo(req):
        now = datetime.datetime.now()
        return render_to_response('../templates/index.html', {'data': now})