from game_manager.consumers import WSConsumerBase

class PongConsumer(WSConsumerBase):
	def join_lobby(self, player, game_id):
		return super()._join_lobby(player, game_id, 'pong')