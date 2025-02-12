from channels.generic.websocket import WebsocketConsumer # type: ignore
from game_manager.handlers import TournamentHandlerBase

class TournamentManager:

	def get_tournament(self, tournament_handler: type[TournamentHandlerBase], tournament_id: str):
		self._get_object(tournament_handler, tournament_id)

	def remove_tournament(self, tournament_id: str):
		self._remove_object(tournament_id)

tournament_manager = TournamentManager()