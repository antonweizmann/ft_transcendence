from channels.generic.websocket import WebsocketConsumer # type: ignore
from game_base.handlers import TournamentHandlerBase
from .manager_base import ManagerBase

class TournamentManager(ManagerBase):

	def get_tournament(self, tournament_handler: type[TournamentHandlerBase], tournament_id: str):
		self._get_object(tournament_handler, tournament_id)

	def remove_tournament(self, tournament_id: str):
		self._remove_object(tournament_id)

tournament_manager = TournamentManager()