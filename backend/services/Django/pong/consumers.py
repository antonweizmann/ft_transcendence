from game_base.consumers import GameBaseConsumer
from pong.pong_handler import PongHandler

class PongConsumer(GameBaseConsumer):
	def join_lobby(self, player, game_id):
		return super()._join_lobby(player, game_id, PongHandler)