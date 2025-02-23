from game_base.consumers import TournamentBaseConsumer
from pong.handlers import PongTournamentHandler

class PongTournamentConsumer(TournamentBaseConsumer):
	_subtype = 'Pong'

	def __init__(self, *args, **kwargs):
		super().__init__(*args, **kwargs)
		self._handler: type[PongTournamentHandler] | None = None

	def join_lobby(self, object_id):
		return super().join_lobby(object_id, PongTournamentHandler)