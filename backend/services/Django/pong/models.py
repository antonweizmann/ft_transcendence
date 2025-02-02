from django.db import models # type: ignore
from django.contrib.auth import get_user_model # type: ignore
from game_manager.models import GameMatchBase

User = get_user_model()

class PongMatch(GameMatchBase):
	class Meta:
		verbose_name = 'Pong Match'
		verbose_name_plural = 'Pong Matches'

	game_type = 'Pong'
	required_players = 2

	def __str__(self):
		return_str = super().__str__()
		if self.status != 'waiting':
			return_str += f"\n\t- Scores: {self.scores}"
