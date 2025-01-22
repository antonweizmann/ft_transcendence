from rest_framework import serializers
from .models import User

class UserSerializer(serializers.ModelSerializer):
	class Meta:
		model = User
		fields = ['id', 'username', 'email', 'date_of_birth', 'created_at', 
			'friends', 'friend_requests_sent', 'friend_requests_received',
			'last_connection']