from .game_logic import GameHandlerBase
from channels.generic.websocket import WebsocketConsumer # type: ignore

class GameManager:
	__instance = None

	def __new__(cls, *args, **kwargs):
		if not cls.__instance:
			cls.__instance = super(GameManager, cls).__new__(cls, *args, **kwargs)
			cls.__instance.games = {}
		return cls.__instance

	def get_game(self, GameHandler: GameHandlerBase, game_id: str):
		if game_id not in self.games:
			self.games[game_id] = GameHandler._create(game_id)
		return self.games[game_id]

	# def remove_game(self, game_id: str):
	# 	if game_id in self.games:
	# 		del self.games[game_id]

game_manager = GameManager()