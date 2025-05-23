import inspect
import threading

from typing import Protocol, Optional, Set, Dict, Callable, Any
from django.contrib.auth import get_user_model # type: ignore
from django.db import models # type: ignore

Player = get_user_model()

class SendFunc(Protocol):
	def __call__(self, message, error: bool = False) -> None:
		pass

class CoreBaseHandler:
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
		return super(CoreBaseHandler, cls).__new__(cls)

	def __del__(self):
		if self._thread is not None and self._thread.is_alive():
			self._thread.join()
		if self._model.status == 'in_progress':
			self._model.status = 'finished'
			self._model.save()
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
			and player != self._indexes[player_index]):
			player_index += 1
		if player_index not in self._indexes:
			self._indexes[player_index] = player
		return player_index

	def _add_player(self, player: Player) -> int: # type: ignore
		player_index = self._get_index(player)
		if (player_index < self._required_players):
			self._model.players.add(player)
			self.players.append(player)
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
			if len(self.players) == 0:
				self._send_func = None
				self._is_active = False
				return

	def _leave(self, player: Player): # type: ignore
		self._rm_player(player)
		if self._send_func is None:
			return
		self._send_lobby_update()

	def _send_lobby_update(self, extra_fields: Optional[Dict[str, Any]] = None):
		with self._lock:
			if self._send_func is None:
				return
			message = {
				'type': 'lobby_update',
				f'{self._type.lower()}_id': self._id,
				'players': [{'index': index, 'username': player.username} for\
					index, player in self._indexes.items() if player in self.players]
			}
		if extra_fields:
			message.update(extra_fields)
		with self._lock:
			self._send_func(message)

	def _start(self, player_index: int, run_func: Optional[Callable]):
		if not self._allowed_to_start(player_index):
			return
		with self._lock:
			self._is_active = True
			self._model.status = 'in_progress'
			self._model.save()
		if run_func:
			run_func()

	def _serialize_state(self) -> Dict[str, Any]:
		with self._lock:
			serialized_state = self._state.copy()
		return serialized_state

	def _send_state(self):
		with self._lock:
			if self._send_func is None:
				raise ValueError(f'You must join a {self._type} before sending state.')
			self._send_func({
				'type': f'{self._subtype.lower()}_{self._type.lower()}_update',
				f'{self._type.lower()}_id': self._id,
				f'{self._type.lower()}_state': self._serialize_state()
			})

	def _allowed_to_join(self, player: Player, send_func: SendFunc): # type: ignore
		with self._lock:
			if self._model.status == 'finished':
				send_func({
					'type': 'error',
					'details': f'{self._type} has already finished.'
				}, None)
				return False
			if player in self.players:
				send_func({
					'type': 'error',
					'details': 'Player already joined.'
				}, None)
				return False
			return True

	def _allowed_to_start(self, player_index: int) -> bool:
		if (self._send_func is None or player_index == None
			or player_index not in self._indexes):
			raise ValueError(f'You must join a {self._type} before starting.')
		if self.get_status() == 'finished':
			self._send_func({
				'type': 'error',
				'details': f'{self._type} has already finished.'
			}, player_index)
			return False
		with self._lock:
			if player_index >= self._required_players:
				self._send_func({
					'type': 'error',
					'details': f'You are spectating the {self._type}, relax and enjoy the show.'
				}, player_index)
				return False
			if self._required_players > len(self.players):
				self._send_func({
					'type': 'error',
					'details': 'Waiting for other players to join.'
				}, player_index)
				return False
			if self._is_active:
				self._send_func({
					'type': 'error',
					'details': f'{self._type} has already started.'
				}, player_index)
				return False
		return True

	def get_status(self):
		with self._lock:
			self._model.refresh_from_db()
			status = self._model.status
		return status

	def get_results(self):
		with self._lock:
			self._model.refresh_from_db()
			results = self._model.result
		return results
