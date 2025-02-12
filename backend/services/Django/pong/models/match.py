from django.db import models # type: ignore
from game_base.models import GameMatchBase

class PongMatch(GameMatchBase):
	class Meta:
		verbose_name = 'Pong Match'
		verbose_name_plural = 'Pong Matches'

	game_type = models.CharField(max_length=20, default='Pong')
	required_players = models.IntegerField(default=2)
	tournament = models.ForeignKey('PongTournament', related_name='matches',
		on_delete=models.CASCADE, null=True, blank=True)

	def __str__(self):
		return_str = super().__str__()
		if self.status != 'waiting':
			return_str += f"\n\t- Scores: {self.scores}"
		return return_str
