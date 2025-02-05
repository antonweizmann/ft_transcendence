from channels.generic.websocket import WebsocketConsumer # type: ignore
from .game_handler import GameHandlerBase

class GameManager:
	__instance = None
	__games = {}

	def __new__(cls, *args, **kwargs):
		if not cls.__instance:
			cls.__instance = super(GameManager, cls).__new__(cls, *args, **kwargs)
		return cls.__instance

	def get_game(self, game_handler: type[GameHandlerBase], game_id: str):
		if game_id not in self.__games:
			self.__games[game_id] = game_handler(game_id)
		return self.__games[game_id]

	def remove_game(self, game_id: str):
		if game_id in self.__games:
			del self.__games[game_id]

game_manager = GameManager()