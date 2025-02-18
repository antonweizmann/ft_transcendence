from django.contrib import admin # type: ignore
from .models import PongMatch

# Register your models here.
class PongMatchAdmin(admin.ModelAdmin):
	model = PongMatch
	readonly_fields = ('result', 'game_type', 'required_players')
	fieldsets = (
		(None, {'fields': (
			'game_type', 'required_players', 'players', 'scores', 'result',
			'status'
			)}),
		)

admin.site.register(PongMatch, PongMatchAdmin)
