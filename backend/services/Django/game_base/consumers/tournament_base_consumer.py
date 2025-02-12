from channels.generic.websocket import WebsocketConsumer # type: ignore
from game_base.managers import TournamentManager

class TournamentBaseConsumer(WebsocketConsumer):
	class Meta:
		abstract = True

	def __init__(self, *args, **kwargs):
		super().__init__(*args, **kwargs)
		self.tournament_manager = TournamentManager()
		self.tournament_id = None
		self.player = None
		self.in_tournament = False