from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import Player

class PlayerAdmin(UserAdmin):
    model = Player
    fieldsets = UserAdmin.fieldsets + (
        (None, {'fields': ('friends', 'friend_requests')}),
    )

admin.site.register(Player, PlayerAdmin)