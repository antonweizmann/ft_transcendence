from django.contrib import admin # type: ignore
from django.contrib.auth.admin import UserAdmin # type: ignore
from .models import Player
from django.utils.html import format_html # type: ignore

class PlayerAdmin(UserAdmin):
	model = Player
	fieldsets = UserAdmin.fieldsets + (
		(None, {'fields': ('friends', 'friend_requests', 'profile_picture')}),
		)
	list_display = (
		'profile_picture_display', 'username', 'email', 'first_name',
		'last_name', 'is_staff'
		)

	def profile_picture_display(self, obj):
		if obj.profile_picture:
			return format_html('<img src="{}" width="50" height="50" />'.format(obj.profile_picture.url))
		return 'No Image'
	profile_picture_display.allow_tags = True
	profile_picture_display.short_description = 'Profile Picture'

	def delete_model(self, request, obj):
		obj.delete()

admin.site.register(Player, PlayerAdmin)