from django.contrib import admin # type: ignore
from .models import PongMatch, PongTournament

# Register your models here.
class PongMatchAdmin(admin.ModelAdmin):
	model = PongMatch
	readonly_fields = ('result', 'game_type', 'required_players', 'created_at', 'updated_at')
	fieldsets = (
		(None, {'fields': (
			'game_type', 'required_players', 'players', 'scores', 'result',
			'status', 'created_at', 'updated_at', 'tournament'
			)}),
		)

class PongTournamentAdmin(admin.ModelAdmin):
	model = PongTournament
	readonly_fields = ('created_at', 'updated_at')
	fieldsets = (
		(None, {'fields': (
			'name', 'description', 'players', 'status', 'created_at', 'updated_at'
			)}),
		)

admin.site.register(PongMatch, PongMatchAdmin)
admin.site.register(PongTournament, PongTournamentAdmin)