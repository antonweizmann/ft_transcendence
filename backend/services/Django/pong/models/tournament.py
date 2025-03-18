from django.db import models # type: ignore
from django.contrib.auth import get_user_model # type: ignore
from game_base.models import TournamentBaseModel

User = get_user_model()

class PongTournament(TournamentBaseModel):
	class Meta:
		verbose_name = 'Pong Tournament'
		verbose_name_plural = 'Pong Tournaments'

	players = models.ManyToManyField(User, related_name='pong_tournaments', blank=True)