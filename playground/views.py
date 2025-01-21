from django.shortcuts import render
from django.http import HttpResponse

# Create your views here.
# request handler
def say_hello(request):
	return render(request, 'hello.html', {'name': 'John'})

def home(request):
	return render(request, 'home.html')