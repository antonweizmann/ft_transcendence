from game_manager.consumers import WSConsumerBase
from pong.pong_handler import PongHandler

class PongConsumer(WSConsumerBase):
	def join_lobby(self, player, game_id):
		return super()._join_lobby(player, game_id, PongHandler)