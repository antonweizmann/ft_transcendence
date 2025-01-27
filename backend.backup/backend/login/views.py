from django.shortcuts import render, redirect
from rest_framework import generics
from .models import User
from .serializers import UserSerializer
from django.contrib.auth import authenticate, login
from django.contrib.auth.forms import UserCreationForm

# Create your views here.
class UserList(generics.ListCreateAPIView):
	queryset = User.objects.all()
	serializer_class = UserSerializer

def register(request):
	if request.method == 'POST':
		form = UserCreationForm(request.POST)
		if form.is_valid():
			form.save()
			username = form.cleaned_data.get('username')
			raw_password = form.cleaned_data.get('password1')
			user = authenticate(username=username, password=raw_password)
			login(request, user)
			print(form)
			return redirect('/users/')
		else:
			print(form.errors)
	form = UserCreationForm()
	return render(request, 'register.html', { 'form': form })