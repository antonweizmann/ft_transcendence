from rest_framework import serializers # type: ignore
from django.core.files.storage import default_storage # type: ignore
from player.models import Player

class PlayerSerializer(serializers.ModelSerializer):
	friend_requests_received = serializers.SerializerMethodField()

	def create(self, validated_data):
		groups_data = validated_data.pop('groups', None)
		password = validated_data.pop('password', None)
		profile_picture = validated_data.pop('profile_picture', None)
		if password is None:
			raise serializers.ValidationError({"password": "Password is required."})
		instance = super().create(validated_data)
		if groups_data:
			instance.groups.set(groups_data)
		instance.set_password(password)
		instance.profile_picture = 'profile_pictures/default.png'
		instance.save()
		if profile_picture:
			instance.profile_picture = profile_picture
		instance.save()
		return instance

	def update(self, instance, validated_data):
		groups_data = validated_data.pop('groups', None)
		password = validated_data.pop('password', None)
		profile_picture = validated_data.pop('profile_picture', None)
		for attr, value in validated_data.items():
			setattr(instance, attr, value)
		if password is not None:
			instance.set_password(password)
		if groups_data:
			instance.groups.set(groups_data)
		if profile_picture and profile_picture != instance.profile_picture:
			if (instance.profile_picture and
				instance.profile_picture.path != 'profile_pictures/default.png'):
				if default_storage.exists(instance.profile_picture.path):
					default_storage.delete(instance.profile_picture.path)
			instance.profile_picture = profile_picture
		instance.save()
		return instance

	def get_friend_requests_received(self, instance):
		return [
			{"id": player.id, "username": player.username}
			for player in instance.friend_requests_received.all()
		]

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
			'friend_requests_received',
			'last_login',
			'date_joined',
			'profile_picture'
			]

		extra_kwargs = {
			'username':					{'required': True},
			'first_name':				{'required': True},
			'last_name':				{'required': True},
			'password':					{'required': True, 'write_only': True},
			'email':					{'required': False},
			'id':						{'required': False, 'read_only': True},
			'groups':					{'required': False},
			'friends':					{'required': False, 'read_only': True},
			'friend_requests':			{'required': False, 'read_only': True},
			'friend_requests_received': {'required': False, 'read_only': True},
			'last_login':				{'required': False, 'read_only': True},
			'date_joined':				{'required': False, 'read_only': True},
			'profile_picture':			{'required': False}
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
			'date_joined',
			'profile_picture'
			]

		extra_kwargs = {
			'id':				{ 'read_only': True},
			'username':			{ 'read_only': True},
			'groups':			{ 'read_only': True},
			'friends':			{ 'read_only': True},
			'friend_requests':	{ 'read_only': True},
			'last_login':		{ 'read_only': True},
			'date_joined':		{ 'read_only': True},
			'profile_picture':	{ 'read_only': True}
		}
