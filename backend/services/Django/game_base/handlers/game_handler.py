import threading

from game_base.models import GameBaseModel
from django.contrib.auth import get_user_model # type: ignore
from .core_base_handler import SendFunc, CoreBaseHandler
from .tournament_handler import TournamentHandlerBase

Player = get_user_model()

class GameHandlerBase(CoreBaseHandler):
	class Meta:
		abstract = True

	_type: str		= 'Game'
	_subtype: str	= 'Unknown'

	def __init__(self, game_id: str):
		super().__init__(game_id)
		self._tournament: type[TournamentHandlerBase] | None	= None
		self._model: type[GameBaseModel] | None					= None
		self._state												= {'score': {}}
		self._id												= game_id

	def join_match(self, player: Player, send_func: SendFunc) -> int | None: # type: ignore
		return super()._join(player, send_func)

	def leave_match(self, player: Player): # type: ignore
		super()._leave(player)

	def start_game(self, player_index: int):
		self._thread = threading.Thread(target=self._run_game)
		self._state['score'] = {player.username: 0 for player in self.players}
		super()._start(player_index, self._thread.start)

	def _send_game_state(self):
		super()._send_state()

	def _run_game(self):
		raise NotImplementedError

	def _update_game_state(self):
		raise NotImplementedError

	def _check_win_conditions(self):
		raise NotImplementedError

# Don't forget to add the following code to the child class when the game is finished:
		self._is_active = False
		self._model.status = 'finished'

	def move(self, player_index, move):
		raise NotImplementedError
	
	def tournament_setup(self, tournament, players):
		with self._lock:
			self._tournament = tournament
			self._model.tournament = tournament._model
			self._model.save()
			for player in players:
				self._get_index(player)
			self._model.status = 'in_progress'

	def _update_tournament(self):
		with self._lock:
			if self._tournament is not None:
				self._tournament._update_game_state()
