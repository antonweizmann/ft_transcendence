from django.db import models # type: ignore
from blockchain.contracts import contract, account
from game_base.models import GameBaseModel

class PongGameModel(GameBaseModel):
	class Meta:
		verbose_name = 'Pong Match'
		verbose_name_plural = 'Pong Matches'

	def __init__(self, *args, **kwargs):
		super().__init__(*args, **kwargs)
		self.__in_blockchain = False

	game_type = models.CharField(max_length=20, default='Pong')
	required_players = models.IntegerField(default=2)
	tournament = models.ForeignKey('PongTournamentModel', related_name='matches',
		on_delete=models.CASCADE, null=True, blank=True)

	def __str__(self):
		return_str = super().__str__()
		if self.status != 'waiting':
			return_str += f"\n\t- Scores: {self.scores}"
		return return_str

	def save(self, *args, **kwargs):
		super().save(*args, **kwargs)
		if self.status == 'finished' and self.result is not None and self.__in_blockchain is False:
			self.__in_blockchain = True
			players = self.players.all()
			contract.functions.setMatchScore(
				self.id,
				players[0].id,
				players[1].id,
				self.scores.get(players[0].username),
				self.scores.get(players[1].username)
			).transact({'from': account.address})