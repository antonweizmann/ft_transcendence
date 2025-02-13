import threading

from game_base.models import GameMatchBase
from django.contrib.auth import get_user_model # type: ignore
from .core_base_handler import SendFunc, CoreHandlerBase

Player = get_user_model()

class GameHandlerBase(CoreHandlerBase):
	class Meta:
		abstract = True

	_handler_type: str	= 'Game'
	_subtype: str		= 'Unknown'

	def __init__(self, game_id: str):
		super().__init__(game_id)
		self._model: type[GameMatchBase] | None	= None
		self._id								= game_id
		self._state								= {'score': {}}

	def join_match(self, player: Player, send_func: SendFunc) -> int | None: # type: ignore
		return super()._join(player, send_func)

	def leave_match(self, player: Player): # type: ignore
		super()._leave(player)

	def start_game(self, player_index: int):
		game_thread = threading.Thread(target=self._run_game)
		self._state['score'] = {player.__str__(): 0 for player in self.players}
		super()._start(player_index, game_thread.start)

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
		self._model.save()

	def move(self, player_index, move):
		raise NotImplementedError
