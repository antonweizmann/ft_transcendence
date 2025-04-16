import threading
import json

from game_base.models import TournamentBaseModel
from django.contrib.auth import get_user_model # type: ignore
from .core_base_handler import SendFunc, CoreBaseHandler

Player = get_user_model()

class TournamentHandlerBase(CoreBaseHandler):
	class Meta:
		abstract = True

	_type: str		= 'Tournament'
	_subtype: str	= 'Unknown'
	_MIN_PLAYERS	= 3
	_MAX_PLAYERS	= 8

	def __init__(self, tournament_id: str):
		super().__init__(tournament_id)
		self._model: type[TournamentBaseModel] | None	= None
		self._id										= tournament_id
		self._required_players: int						= self._MIN_PLAYERS
		self._state										= {
			'pending_matches': [],
			'finished_matches': [],
			'current_match': None,
			'leaderboard': {},
			'is_ready_to_start': {}
		}

	def _serialize_state(self):
		serialized_state = super()._serialize_state()
		del serialized_state['is_ready_to_start']
		return serialized_state

	def join_tournament(self, player: Player, send_func: SendFunc) -> int | None: # type: ignore
		player_index = super()._join(player, send_func)
		if player_index is not None and player_index < self._required_players:
			self._state['is_ready_to_start'].update({player.username: False})
		return player_index

	def leave_tournament(self, player: Player): # type: ignore
		super()._leave(player)
		with self._lock:
			if (player in self._state['is_ready_to_start'] and
				self.get_status() == 'waiting'):
				del self._state['is_ready_to_start'][player]
			for player in self._state['is_ready_to_start']:
				self._state['is_ready_to_start'][player] = False
			self._send_func({
			'type': 'ready_update',
			'players_ready':json.dumps(self._state['is_ready_to_start']),
		})

	def _start_tournament(self, player_index: int):
		tournament_thread = threading.Thread(target=self._start_matches)
		super()._start(player_index, tournament_thread.start)

	def __ready_to_start(self)-> bool:
		return (all(self._state['is_ready_to_start'].values())
			and len(self.players) >= self._required_players)

	def mark_ready_and_start(self, player_index: int):
		if not self._allowed_to_start(player_index):
			return
		player_str = self._indexes[player_index].username
		self._state['is_ready_to_start'][player_str] = True
		self._send_func({
			'type': 'ready_update',
			'details': f'Player #{player_index} {player_str} is ready to start.',
			'player': f'{player_str}',
			'players_ready':json.dumps(self._state['is_ready_to_start']),
		})
		if self.__ready_to_start():
			self._start_tournament(player_index)

	def set_tournament_size(self, size: int):
		with self._lock:
			if self._model.status != 'waiting':
				raise ValueError('Cannot change size after tournament has started.')
		if (size < self._MIN_PLAYERS
				or size > self._MAX_PLAYERS
				or not isinstance(size, int)):
			raise ValueError('Size must be an integer between ' +
					f'{self._MIN_PLAYERS} and {self._MAX_PLAYERS}.')
		self._required_players = size
		self._model.size = size
		self._model.save()
		for index in self._indexes:
			if index >= size:
				# self.leave_tournament(self._indexes[index])
				self._send_func({
					'type': 'player_is_spectator',
					'message': f'Player #{index} is an spectator now.',
					'index': f'{index}'
				})
		self._send_func({
				'type': 'size_update',
				'details': f'Tournament size changed to {size}.',
				'size': f'{size}',
				'player_count': f'{len(self.players)}'
			})

	def __can_change_model_values(self, new_value: str):
		with self._lock:
			if self._model.status != 'waiting':
				raise ValueError('Cannot change values after tournament has started.')
		if not isinstance(new_value, str) and len(new_value) > 0:
			raise ValueError('Value must be a non-empty string')
		if self._model is None:
			raise ValueError('_model object must be set in __init__ from the ' +
					'child class before calling this method.')

	def set_description(self, description: str):
		self.__can_change_model_values(description)
		self._model.description = description
		self._model.save()

	def set_name(self, name: str):
		self.__can_change_model_values(name)
		self._model.name = name
		self._model.save()

	def _set_matches(self):
		raise NotImplementedError

	def _start_matches(self):
		raise NotImplementedError

	def _send_lobby_update(self):
		status = self.get_status()
		extra_fields = {
			'size': self._required_players,
		}
		super()._send_lobby_update(extra_fields)
		if status == 'in_progress':
			self._send_state()