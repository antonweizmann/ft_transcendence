from channels.generic.websocket import WebsocketConsumer # type: ignore
from game_base.handlers import GameHandlerBase
from .manager_base import ManagerBase

class GameManager(ManagerBase):

	def get_game(self, game_handler: type[GameHandlerBase], game_id: str):
		return self._get_object(game_handler, game_id)

	def remove_game(self, game_id: str):
		return self._remove_object(game_id)

game_manager = GameManager()