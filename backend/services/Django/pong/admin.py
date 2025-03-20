from django.contrib import admin # type: ignore
from .models import PongGameModel, PongTournamentModel

# Register your models here.
class PongMatchAdmin(admin.ModelAdmin):
	model = PongGameModel
	readonly_fields = ('result', 'game_type', 'required_players', 'created_at', 'updated_at')
	search_fields = ('status', 'players__username')
	fieldsets = (
		(None, {'fields': (
			'game_type', 'required_players', 'players', 'scores', 'result',
			'status', 'created_at', 'updated_at', 'tournament'
			)}),
		)

class PongGameInline(admin.TabularInline):
	model = PongGameModel
	extra = 0
	fieldsets = (
		(None, {'fields': (
			'players', 'required_players', 'scores', 'result',
			'status', 'created_at', 'updated_at'
			)}),
		)
	readonly_fields = ('status', 'scores', 'result', 'required_players', 'created_at', 'updated_at')

class PongTournamentAdmin(admin.ModelAdmin):
	model = PongTournamentModel
	readonly_fields = ('created_at', 'updated_at')
	search_fields = ('name', 'lobby_id', 'status', 'players__username')
	fieldsets = (
		(None, {'fields': (
			'name', 'lobby_id', 'description', 'size', 'players', 'status', 'leaderboard', 'created_at', 'updated_at'
			)}),
		)
	inlines = [PongGameInline]

admin.site.register(PongGameModel, PongMatchAdmin)
admin.site.register(PongTournamentModel, PongTournamentAdmin)