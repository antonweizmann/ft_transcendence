from django.contrib.auth.models import User
from rest_framework import serializers

class UserSerializer(serializers.ModelSerializer):
	class Meta:
		model = User
		fields = [
			'id',
			'username',
			'first_name',
			'last_name',
			'email',
			'password',
			]
		extra_kwargs = {
			"first_name": { "required": True, "write_only": True },
			"last_name": { "required": True, "write_only": True },
			"email": { "required": False},
			"password": { "write_only": True }
		}

	def create(self, validated_data):
		user = User.objects.create_user(**validated_data)
		return user