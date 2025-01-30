from rest_framework import serializers
from player.models import Player

class PlayerSerializer(serializers.ModelSerializer):

	def create(self, validated_data):
		password = validated_data.pop('password', None)
		if password is None:
			raise serializers.ValidationError({"password": "Password is required."})
		instance = self.Meta.model(**validated_data)
		instance.set_password(password)
		instance.save()
		return instance

	def update(self, instance, validated_data):
		password = validated_data.pop('password', None)
		for attr, value in validated_data.items():
			setattr(instance, attr, value)
		if password is not None:
			instance.set_password(password)
		instance.save()
		return instance

	class Meta:
		model = Player
		fields = [
			'username',
			'first_name',
			'last_name',
			'password',
			'email',
			'id',
			'groups',
			'friends',
			'friend_requests',
			'last_login',
			'date_joined'
			]

		extra_kwargs = {
			'username':			{'required': True},
			'first_name':		{'required': True},
			'last_name':		{'required': True},
			'password':			{'required': True, 'write_only': True},
			'email':			{'required': False},
			'id':				{'required': False, 'read_only': True},
			'groups':			{'required': False},
			'friends':			{'required': False, 'read_only': True},
			'friend_requests':	{'required': False, 'read_only': True},
			'last_login':		{'required': False, 'read_only': True},
			'date_joined':		{'required': False, 'read_only': True},
		}

class PublicPlayerSerializer(serializers.ModelSerializer):
	class Meta:
		model = Player
		fields = [
			'id',
			'username',
			'groups',
			'friends',
			'last_login',
			'date_joined'
			]

		extra_kwargs = {
			'id':				{ 'read_only': True},
			'username':			{ 'read_only': True},
			'groups':			{ 'read_only': True},
			'friends':			{ 'read_only': True},
			'friend_requests':	{ 'read_only': True},
			'last_login':		{ 'read_only': True},
			'date_joined':		{ 'read_only': True},
		}
