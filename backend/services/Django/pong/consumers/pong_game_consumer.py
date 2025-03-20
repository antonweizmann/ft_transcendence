from game_base.consumers import GameBaseConsumer
from pong.handlers import PongGameHandler

class PongGameConsumer(GameBaseConsumer):
	_subtype = 'Pong'

	def join_lobby(self, game_id):
		return super()._join_lobby(game_id, PongGameHandler)