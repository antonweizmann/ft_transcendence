import json
import threading
import inspect

from typing import Protocol, Optional, List, Dict
from game_base.models import GameMatchBase
from django.contrib.auth import get_user_model # type: ignore

Player = get_user_model()

class SendFunc(Protocol):
	def __call__(self, message, error: bool = False) -> None:
		pass

class GameHandlerBase:
	class Meta:
		abstract = True

	required_players = 1

	def __new__(cls, *args, **kwargs):
		stack = inspect.stack()
		try:
			caller = stack[2].function
		except IndexError:
			caller = ''
		if caller != 'get_game':
			raise TypeError("Instances of any GameHandler can only be "\
					"created using the GameManager.get_game().")
		return super(GameHandlerBase, cls).__new__(cls)

	def __init__(self, game_id: str):
		self.results: type[GameMatchBase] | None = None
		self.is_game_running = False
		self.send_func : Optional[SendFunc] = None
		self.game_type : str = 'Unknown'
		self.game_id = game_id
		self.game_state = { 'score': {} }
		self.players: List[Player] = []
		self._indexes: Dict[int, Player] = {}

	def _get_index(self, player: Player)-> int:
		player_index = 0
		while (self._indexes.get(player_index) is not None
			and player is not self._indexes[player_index]):
			player_index += 1
		if player_index not in self._indexes:
			self._indexes[player_index] = player
		return player_index

	def join_match(self, player: Player, send_func: SendFunc) -> int | None:
		if not self._allowed_to_join(player, send_func):
			return
		if self.results is None:
			raise ValueError('Results object must be set in __init__ from the child class.')
		self.results.players.add(player)
		self.players.append(player)
		player_index = self._get_index(player)
		self.send_func = send_func
		self._send_lobby_update()
		return player_index

	def leave_match(self, player: Player):
		if player not in self.players:
			return
		self.players.remove(player)
		if self.results.status == 'waiting':
			self.results.players.remove(player)
			for index, p in self._indexes.items():
				if p == player:
					player_index = index
					break
			if player_index is not None:
				del self._indexes[player_index]
		if self.send_func is None:
			return
		self._send_lobby_update()

	def _send_lobby_update(self):
		self.send_func(json.dumps({
			'type': 'lobby_update',
			'game_id': self.game_id,
			'players': [{'index': index, 'username': player.username} for\
				index, player in self._indexes.items()]
		}))

	def start_game(self, player_index):
		if not self._allowed_to_start(player_index):
			return
		self.game_state['score'] = {player.__str__(): 0 for player in self.players}
		self.is_game_running = True
		self.results.status = 'in_progress'
		self.results.save()
		game_thread = threading.Thread(target=self._run_game)
		game_thread.start()

	def _send_game_state(self):
		if self.send_func is None:
			raise ValueError('You must join a match before sending game state.')
		self.send_func(json.dumps({
			'type': f'{self.game_type}_update',
			'game_id': self.game_id,
			'game_state': self.game_state
		}))

	def _allowed_to_join(self, player: Player, send_func: SendFunc):
		if self.results.status == 'finished':
			send_func(json.dumps({
				'type': 'error',
				'message': 'Game has already finished.'
			}), True)
			return False
		if self.is_game_running:
			send_func(json.dumps({
				'type': 'error',
				'message': 'Game has already started.'
			}), True)
			return False
		if player in self.players:
			send_func(json.dumps({
				'type': 'error',
				'message': 'Player already joined.'
			}), True)
			return False
		if len(self.players) >= self.required_players:
			send_func(json.dumps({
				'type': 'error',
				'message': 'Game lobby is full.'
			}), True)
			return False
		return True
	
	def _allowed_to_start(self, player_index: int) -> bool:
		if self.send_func is None or player_index == None:
			raise ValueError('You must join a match before starting the game.')
		if self.results.status == 'finished':
			self.send_func(json.dumps({
				'type': 'error',
				'message': 'Game has already finished.'
			}), True)
			return False
		if self.required_players != len(self.players):
			self.send_func(json.dumps({
				'type': 'error',
				'message': 'Waiting for other players to join.'
			}))
			return False
		return True

	def _run_game(self):
		raise NotImplementedError

	def _update_game_state(self):
		raise NotImplementedError
	
	def _check_win_conditions(self):
		raise NotImplementedError

# Don't forget to add the following code to the child class when the game is finished:
		self.is_game_running = False
		self.results.status = 'finished'
		self.results.save()

	def move(self, player_index, move):
		raise NotImplementedError
