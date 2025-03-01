import json
import inspect
import threading

from typing import Protocol, Optional, Set, Dict, Callable, Any
from django.contrib.auth import get_user_model # type: ignore
from django.db import models # type: ignore

Player = get_user_model()

class SendFunc(Protocol):
	def __call__(self, message, error: bool = False) -> None:
		pass

class CoreHandlerBase:
	class Meta:
		abstract = True

	_type: str			= 'Abstract'
	_subtype: str		= 'Unknown'
	_required_players	= 1

	def __new__(cls, *args, **kwargs):
		stack = inspect.stack()
		try:
			caller = stack[1].function
		except IndexError:
			caller = ''
		if caller != '_get_object':
			raise TypeError(f"Instances of any {cls._type}Handler can " +
				f"only be created through " +
				f"{cls._type}Manager.get_{cls._type.lower()}().")
		return super(CoreHandlerBase, cls).__new__(cls)

	def __del__(self):
		with self._lock:
			if self._model.status == 'in_progress':
				self._model.status = 'finished'
				self._model.save()
			if self._thread is not None:
				self._thread.join()
			if self._model.status == 'waiting':
				self._model.delete()

	def __init__(self, id: str):
		self._id: str 							= id
		self._model: type[models.Model] | None	= None
		self._state: Dict[str, Any]				= {}
		self._indexes: Dict[int, Player]		= {} # type: ignore
		self._is_active: bool					= False
		self._send_func: Optional[SendFunc]		= None
		self.players: Set[Player]				= [] # type: ignore
		self._thread: threading.Thread | None	= None
		self._lock								= threading.RLock()

	def _get_index(self, player: Player)-> int: # type: ignore
		player_index = 0
		while (self._indexes.get(player_index) is not None
			and player is not self._indexes[player_index]):
			player_index += 1
		if player_index not in self._indexes:
			self._indexes[player_index] = player
		return player_index

	def _add_player(self, player: Player) -> int: # type: ignore
		self._model.players.add(player)
		self.players.append(player)
		player_index = self._get_index(player)
		return player_index

	def _join(self, player: Player, send_func: SendFunc) -> int | None: # type: ignore
		if not self._allowed_to_join(player, send_func):
			return
		if self._model is None:
			raise ValueError('_model object must be set in __init__ from the child class.')
		player_index = self._add_player(player)
		self._send_func = send_func
		self._send_lobby_update()
		return player_index

	def _rm_player(self, player: Player): # type: ignore
		with self._lock:
			if player in self.players:
				self.players.remove(player)
			if self._model.status == 'waiting':
				if player in self._model.players.all():
					self._model.players.remove(player)
				player_index = None
				for index, p in self._indexes.items():
					if p == player:
						player_index = index
						break
				if player_index is not None:
					del self._indexes[player_index]

	def _leave(self, player: Player): # type: ignore
		self._rm_player(player)
		if self._send_func is None:
			return
		self._send_lobby_update()

	def _send_lobby_update(self):
		with self._lock:
			self._send_func(json.dumps({
				'type': 'lobby_update',
				f'{self._type.lower()}_id': self._id,
				'players': [{'index': index, 'username': player.username} for\
					index, player in self._indexes.items() if player in self.players]
			}))

	def _start(self, player_index: int, run_func: Optional[Callable]):
		if not self._allowed_to_start(player_index):
			return
		with self._lock:
			self._is_active = True
			self._model.status = 'in_progress'
			self._model.save()
		if run_func:
			run_func()

	def _send_state(self):
		with self._lock:
			if self._send_func is None:
				raise ValueError(f'You must join a {self._type} before sending state.')
			self._send_func(json.dumps({
				'type': f'{self._subtype.lower()}_{self._type.lower()}_update',
				f'{self._type.lower()}_id': self._id,
				f'{self._type.lower()}_state': self._state
			}))

	def _allowed_to_join(self, player: Player, send_func: SendFunc): # type: ignore
		with self._lock:
			if self._model.status == 'finished':
				send_func(json.dumps({
					'type': 'error',
					'message': f'{self._type} has already finished.'
				}), True)
				return False
			if self._is_active:
				send_func(json.dumps({
					'type': 'error',
					'message': f'{self._type} has already started.'
				}), True)
				return False
			if player in self.players:
				send_func(json.dumps({
					'type': 'error',
					'message': 'Player already joined.'
				}), True)
				return False
			if len(self.players) >= self._required_players:
				send_func(json.dumps({
					'type': 'error',
					'message': f'{self._type} lobby is full.'
				}), True)
				return False
			return True

	def _allowed_to_start(self, player_index: int) -> bool:
		if (self._send_func is None or player_index == None
			or player_index not in self._indexes):
			raise ValueError(f'You must join a {self._type} before starting.')
		with self._lock:
			if self._model.status == 'finished':
				self._send_func(json.dumps({
					'type': 'error',
					'message': f'{self._type} has already finished.'
				}), True)
				return False
			if self._required_players != len(self.players):
				self._send_func(json.dumps({
					'type': 'error',
					'message': 'Waiting for other players to join.'
				}))
				return False
			if self._is_active:
				self._send_func(json.dumps({
					'type': 'error',
					'message': f'{self._type} has already started.'
				}), True)
				return False
		return True
