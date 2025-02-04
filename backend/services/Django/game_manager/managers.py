from pong.pong_logic import PongHandler
from channels.generic.websocket import WebsocketConsumer # type: ignore

game_handlers = {
	'pong': PongHandler
}

class GameManager:
	__instance = None

	def __init__(self):
		self.games = {}

	def __new__(cls, *args, **kwargs):
		if not cls.__instance:
			cls.__instance = super(GameManager, cls).__new__(cls, *args, **kwargs)
		return cls.__instance

	def get_game(self, game_type: str, game_id: str):
		if game_id not in self.games:
			self.games[game_id] = game_handlers[game_type](game_id)
		return self.games[game_id]

	def remove_game(self, game_id: str):
		if game_id in self.games:
			del self.games[game_id]

game_manager = GameManager()