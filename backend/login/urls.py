from django.urls import path
from . import views

urlpatterns = [
	path('users/', views.UserList.as_view(), name='user-list'),
	path('register/', views.register, name='user-registration'),
]