from django.contrib.auth import get_user_model # type: ignore
from game_base.handlers import TournamentHandlerBase
from pong.models import PongTournament
from game_base.managers import GameManager
from game_base.managers import game_manager
import random
import string
import json

Player = get_user_model()

class PongTournamentHandler(TournamentHandlerBase):
	_subtype = 'Pong'

	def __init__(self, tournament_id: str):
		super().__init__(tournament_id)
		self._model = PongTournament.objects.create()

	def _set_matches(self, players_without_match: list[Player]): # type: ignore
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
		self._set_matches(list(self.players))
		return super()._start_tournament(player_index)

	def __qualify_players(self) -> set[Player]: # type: ignore
		players_without_match = set()
		max_score = max(self._state['leaderboard'].values())
		for match in self._state['finished_matches']:
			if any(self._state['leaderboard'][player] != max_score for player in match.keys()):
				continue
			winner = max(match, key=match.get)
			players_without_match.add(winner)
			self._state['leaderboard'][winner] += 1
		return players_without_match

	def _set_next_matches(self, match: list[Player, Player]): # type: ignore
		if len(self._state['pending_matches']) != 0:
			raise ValueError('There are still pending matches')
		players_without_match = self.__qualify_players()
		if match[1] is None:
			extra_player = match[0]
			self._state['leaderboard'][extra_player] += 1
			players_without_match.add(match[0])
		self._set_matches(list(players_without_match))
		if len(self._state['pending_matches']) == 1 and self._state['pending_matches'][0][1] is None:
			self._is_active = False

	def _update_game_state(self, match: list[Player, Player]): # type: ignore
		match_results = self._model.marches[-1].scores
		self._state['current_match'] = None
		self._state['finished_matches'].append(match_results)

	def _start_matches(self):
		self._model.status = 'in_progress'
		self._model.save()
		self._state['leaderboard'] = {player: 0 for player in self.players}
		while self._is_active:
			while self._state['pending_matches']:
				match = self._state['pending_matches'].pop(0)
				if match[1] is None:
					break
				self._start_match(match)
				while True:
					if self._model.matches[-1].status == 'finished':
						self._update_game_state(match)
						break
			self._set_next_matches(match)
			self._send_state()
		self._model.status = 'finished'
		self._model.save()

	def _generate_match_id(self):
		letters = string.ascii_letters + string.digits
		match_id = ''.join(random.choice(letters) for i in range(10))
		while game_manager.get_game(PongHandler, match_id).players != []:
		while game_manager.get_match(match_id).players != []:
			match_id = ''.join(random.choice(letters) for i in range(10))
		self._model.matches.append(game_manager.get_match(match_id)._model)
		self._model.save()
		return match_id

	def _start_match(self, match: list[Player, Player]): # type: ignore
		match_id = self._generate_match_id()
		player_1, player_2 = match
		self._state['current_match'] = match_id
		self._send_func(json.dumps({
			'message': f'Match between {player_1} and {player_2} starting...',
			'match_id': match_id
		}))