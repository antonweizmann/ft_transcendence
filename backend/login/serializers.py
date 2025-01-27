from rest_framework import serializers
from .models import User

class UserSerializer(serializers.ModelSerializer):
	class Meta:
		model = User
		fields = ['id', 'username', 'email', 'date_of_birth', 'created_at', 
			'friends', 'friend_requests_sent', 'friend_requests_received',
			'last_connection']
		extra_kwargs = {
			'friends': { 'required': False },
			'friend_requests_sent': { 'required': False },
			'friend_requests_received': { 'required': False },
			'last_connection': { 'read_only': True },
			'created_at': { 'read_only': True },
		}