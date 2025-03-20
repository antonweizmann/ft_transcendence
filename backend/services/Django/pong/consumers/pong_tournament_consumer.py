from game_base.consumers import TournamentBaseConsumer
from pong.handlers import PongTournamentHandler

class PongTournamentConsumer(TournamentBaseConsumer):
	_subtype = 'Pong'

	def join_lobby(self, object_id):
		return super()._join_lobby(object_id, PongTournamentHandler)