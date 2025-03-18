from django.contrib.auth import get_user_model # type: ignore
from game_base.handlers import TournamentHandlerBase
from pong.models import PongTournament
from game_base.managers import GameManager
import random
import string
import json

Player = get_user_model()

class PongTournamentHandler(TournamentHandlerBase):
	_subtype = 'Pong'

	def __init__(self, tournament_id: str):
		super().__init__(tournament_id)
		self._model = PongTournament.objects.create()

	def _set_matches(self):
		players_without_match = self.players.copy()
		random.shuffle(players_without_match)
		if self._required_players % 2 != 0:
			extra_player = random.choice(players_without_match)
		required_matches = self._required_players // 2
		for i in range(required_matches):
			player_1 = players_without_match.pop()
			player_2 = players_without_match.pop()
			self._state['pending_matches'].append([player_1, player_2])
		if extra_player:
			self._state['pending_matches'].append([extra_player, None])

	def leave_tournament(self, player: Player): # type: ignore
		super().leave_tournament(player)
		self._state['pending_matches'] = []

	def _start_tournament(self, player_index: int):
		if not self._allowed_to_start(player_index):
			return
		self._set_matches()
		return super()._start_tournament(player_index)

	def _start_matches(self):
		while self._is_active:
			for match in self._state['pending_matches']:
				self._start_match(match)

	def _generate_match_id(self):
		letters = string.ascii_letters + string.digits
		match_id = ''.join(random.choice(letters) for i in range(10))
		game_manager = GameManager()
		while game_manager.get_match(match_id).players != []:
			match_id = ''.join(random.choice(letters) for i in range(10))
		return match_id

	def _start_match(self, match: list[Player, Player | None]): # type: ignore
		match_id = self._generate_match_id()
		player_1, player_2 = match
		self._state['current_match'] = match_id
		if player_2 is None:
			self._send_func(json.dumps({
				'message': f'Waiting for an opponent for {player_1}...',
				'match_id': match_id
			}))
		else:
			self._send_func(json.dumps({
				'message': f'Match between {player_1} and {player_2} starting...',
				'match_id': match_id
			}))