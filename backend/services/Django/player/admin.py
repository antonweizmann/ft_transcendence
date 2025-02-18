from django.contrib import admin # type: ignore
from django.contrib.auth.admin import UserAdmin # type: ignore
from .models import Player
from django.utils.html import format_html # type: ignore
from PIL import Image # type: ignore

class PlayerAdmin(UserAdmin):
	model = Player
	fieldsets =(
		(None, {'fields': ('profile_picture_display', 'profile_picture')}),
	) + UserAdmin.fieldsets + (
		("Friends", {'fields': ('friends', 'friend_requests')}),
	)
	readonly_fields = ('profile_picture_display',)
	list_display = (
		'profile_picture_preview', 'username', 'email', 'first_name',
		'last_name', 'is_staff'
		)

	def __get_new_dimensions_image(self, img, max_size: tuple) -> tuple:
		width, height = img.size
		max_width, max_height = max_size

		if width > max_width or height > max_height:
			aspect_ratio = width / height
			if width > height:
				width = max_width
				height = int(max_width / aspect_ratio)
			else:
				height = max_height
				width = int(max_height * aspect_ratio)
		return (width, height)

	def profile_picture_display(self, obj):
		if obj.profile_picture:
			try:
				with Image.open(obj.profile_picture.path) as img:
					width, height = self.__get_new_dimensions_image(img, (250, 250))
					return format_html('<img src="{}" width="{}" height="{}" />'.format(obj.profile_picture.url, width, height))
			except Exception as e:
				return 'Error loading image'
		return 'No Image'
	profile_picture_display.allow_tags = True
	profile_picture_display.short_description = 'Profile Picture'

	def profile_picture_preview(self, obj):
		if obj.profile_picture:
			try:
				with Image.open(obj.profile_picture.path) as img:
					width, height = self.__get_new_dimensions_image(img, (75, 75))
					return format_html('<img src="{}" width="{}" height="{}" />'.format(obj.profile_picture.url, width, height))
			except Exception as e:
				return 'Error loading image'
		return 'No Image'
	profile_picture_preview.allow_tags = True
	profile_picture_preview.short_description = 'Profile Picture'

	def delete_model(self, request, obj):
		obj.delete()

admin.site.register(Player, PlayerAdmin)