from rest_framework.response import Response
from rest_framework.decorators import api_view
from django.contrib.auth.models import User
from .serializers import UserSerializer
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated, AllowAny

@api_view(['GET'])
def getData(request):
	users = User.objects.all()
	serializer = UserSerializer(users, many=True)
	return Response(serializer.data)

@api_view(['POST'])
def register(request):
	serializer = UserSerializer(data=request.data)
	if serializer.is_valid():
		serializer.save()
		return Response(serializer.data)
	return Response(serializer.errors)

class CreateUserView(generics.CreateAPIView):
	queryset = User.objects.all()
	serializer_class = UserSerializer
	permission_classes = (AllowAny,)