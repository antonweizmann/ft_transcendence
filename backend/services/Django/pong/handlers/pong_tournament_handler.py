from django.contrib.auth import get_user_model # type: ignore
from django.db import transaction # type: ignore
from game_base.handlers import TournamentHandlerBase
from pong.models import PongTournamentModel
from pong.handlers import PongGameHandler
from time import sleep
from game_base.managers import game_manager
import random
import string
import json

Player = get_user_model()

class PongTournamentHandler(TournamentHandlerBase):
	_subtype = 'Pong'

	def __init__(self, tournament_id: str):
		super().__init__(tournament_id)
		self._model = PongTournamentModel.objects.create()
		self.set_name("Tournament " + self._id.removesuffix('_tournament_pong'))
		self.set_description("Pong Tournament " + self._id.removesuffix('_tournament_pong') + ", let's play!")
		self._model.lobby_id = self._id.removesuffix('_tournament_pong')
		transaction.on_commit(lambda: self._model.save())
		self._model.refresh_from_db()

	def _set_matches(self, players_without_match: list[str]):
		random.shuffle(players_without_match)
		extra_player = None
		if len(players_without_match) % 2 != 0:
			extra_player = random.choice(players_without_match)
			players_without_match.remove(extra_player)
		required_matches = len(players_without_match) // 2
		for i in range(required_matches):
			player_1 = players_without_match.pop()
			player_2 = players_without_match.pop()
			with self._lock:
				self._state['pending_matches'].append([player_1, player_2])
		if extra_player:
			with self._lock:
				self._state['pending_matches'].append([extra_player, None])

	def _start_tournament(self, player_index: int):
		if not self._allowed_to_start(player_index):
			return
		self._set_matches(list(player.username for player in self.players))
		return super()._start_tournament(player_index)

	def __qualify_players(self) -> set[str]:
		players_without_match = set()
		with self._lock:
			max_score = max(self._state['leaderboard'].values())
			for match in self._state['finished_matches']:
				if any(self._state['leaderboard'][player] != max_score for player in match.keys()):
					continue
				winner = max(match, key=match.get)
				players_without_match.add(winner)
				self._state['leaderboard'][winner] += 1
				self._model.leaderboard = self._state['leaderboard']
				self._model.save()
		return players_without_match

	def _set_next_matches(self, match: list[str, str]):
		with self._lock:
			if len(self._state['pending_matches']) != 0:
				raise ValueError('There are still pending matches')
		players_without_match = self.__qualify_players()
		if match and match[1] is None:
			extra_player = match[0]
			with self._lock:
				self._state['leaderboard'][extra_player] += 1
				self._model.leaderboard = self._state['leaderboard']
				self._model.save()
			players_without_match.add(match[0])
		self._set_matches(list(players_without_match))
		with self._lock:
			if len(self._state['pending_matches']) == 1 and self._state['pending_matches'][0][1] is None:
				self._state['pending_matches'] = []
				self._is_active = False

	def _update_game_state(self):
		latest_match = self._model.matches.order_by('-created_at').first()

		if latest_match:
			latest_match.refresh_from_db()
			match_results = latest_match.result
		else:
			return
		with self._lock:
			self._state['current_match'] = None
			self._state['finished_matches'].append(match_results['player_scores'])
		self._next_match()

	def _tournament_over(self):
		with self._lock:
			if self._model:
				self._model.status = 'finished'
				self._model.save()
		if self._send_func is not None:
			self._send_state()
			self._send_func({
				'type': 'tournament_over',
				'message': 'Tournament is over. Thank you for playing!'
			})

	def _next_match(self):
		match = None
		with self._lock:
			if not self._is_active:
				return self._tournament_over()
			if self._state['pending_matches'] != []:
				match = self._state['pending_matches'].pop(0)
		if match is None or match[1] is None:
			self._set_next_matches(match)
			return self._next_match()
		self._start_match(match)
		if self._send_func is None:
			return
		self._send_state()

	def _start_matches(self):
		with self._lock:
			self._state['leaderboard'] = {player.username: 0 for player in self.players}
			match = self._state['pending_matches'].pop(0)
		self._start_match(match)
		if self._send_func is None:
			return
		self._send_state()

	def _generate_match_id(self):
		letters = string.ascii_letters + string.digits
		match_id = ''.join(random.choice(letters) for i in range(10))
		while game_manager.get_game(PongGameHandler, match_id).players != []:
			match_id = ''.join(random.choice(letters) for i in range(10))
			game_manager.remove_game(match_id)
		game_manager.remove_game(match_id)
		return match_id

	def _start_match(self, match: list[str, str]):
		match_id = self._generate_match_id()
		player_1, player_2 = match
		game_handler = game_manager.get_game(PongGameHandler, match_id + '_game_pong')
		match = [Player.objects.get(username=player_1), Player.objects.get(username=player_2)]
		game_handler.tournament_setup(self, match)
		with self._lock:
			self._state['current_match'] = {match_id: (player_1, player_2)}
			self._send_func(json.dumps({
				'message': f'Match between {player_1} and {player_2} starting...',
				'match_id': match_id
			}))