from django.shortcuts import render
from django.template import loader
from django.template import Library
from django.http import HttpResponse, FileResponse
from django.http import Http404
import os

def retract_pdf(request, pdf_name):
	pdf_path=f'{os.path.dirname(os.path.abspath(__file__))}/templates/{pdf_name}/{pdf_name}.pdf'
	try:
		return FileResponse(open(pdf_path, 'rb'), content_type='application/pdf')
	except:
		raise Http404
