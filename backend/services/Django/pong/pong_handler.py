import time
import random
import json
from math import sqrt
from game_manager.game_handler import GameHandlerBase
from .models import PongMatch

X = 0
Y = 1

BOARD_WIDTH = 800
BOARD_HEIGHT = 500

MIN_BALL_X = 10
MIN_BALL_Y = 10
MAX_BALL_X = BOARD_WIDTH - 10
MAX_BALL_Y = BOARD_HEIGHT - 10
BALL_SPEED = 6.66
INITIAL_BALL_POSITION = [(BOARD_WIDTH / 2), (BOARD_HEIGHT / 2)]

MIN_PLAYER_Y = 50
MAX_PLAYER_Y = BOARD_HEIGHT - 50
PLAYER_SPEED = 10



class PongHandler(GameHandlerBase):
	required_players = 2

	def __set_random_ball_direction(self) -> list[int, int]:
		return [random.choice([-1, 1]), random.choice([-1, 1])]

	def __init__(self, game_id: str):
		super().__init__(game_id)
		self.results= PongMatch.objects.create()
		self.game_type = 'pong'
		self.game_state = {
			'ball_position': INITIAL_BALL_POSITION,
			'ball_direction': self.__set_random_ball_direction(),
			'paddle_1_position': 250,
			'paddle_2_position': 250,
		}

	def _run_game(self):
		target_fps = 60
		target_frame_duration = 1 / target_fps

		while self.is_game_running:
			start_time = time.time()

			self._update_game_state()
			self._send_game_state()

			elapsed_time = time.time() - start_time
			sleep_time = max(0, target_frame_duration - elapsed_time)
			time.sleep(sleep_time)

	def __reset_ball(self):
		self.game_state['ball_position'] = INITIAL_BALL_POSITION
		self.game_state['ball_direction'] = self.__set_random_ball_direction()

	def __score_goal(self):
		if self.game_state['ball_position'][X] <= MIN_BALL_X:
			self.game_state['score'][self.players[1].__str__()] += 1
		elif self.game_state['ball_position'][X] >= MAX_BALL_X:
			self.game_state['score'][self.players[0].__str__()] += 1
		self.results.scores = self.game_state['score']

	def __check_for_collisions(self):
		if (self.game_state['ball_position'][Y] <= MIN_BALL_Y
			or self.game_state['ball_position'][Y] >= MAX_BALL_Y):
			self.game_state['ball_direction'][Y] *= -1

		if (self.game_state['ball_position'][X] <= MIN_BALL_X
			or self.game_state['ball_position'][X] >= MAX_BALL_X):
			self.__reset_ball()
			self.__score_goal()

	def __check_paddle_collisions(self):
		pass

	def __move_ball(self):
		magnitude = sqrt(self.game_state['ball_direction'][X] ** 2
			+ self.game_state['ball_direction'][Y] ** 2)
		normalized_direction = [self.game_state['ball_direction'][X] / magnitude,
			self.game_state['ball_direction'][Y] / magnitude]
		self.game_state['ball_position'][X] += normalized_direction[X] * BALL_SPEED
		self.game_state['ball_position'][Y] += normalized_direction[Y] * BALL_SPEED

	def __check_win_conditions(self):
		if (self.game_state['score'][self.players[1].__str__()] >= 10
				or self.game_state['score'][self.players[0].__str__()] >= 10):
			self.send_func(json.dumps({
				'type': 'game_over',
				'game_id': self.game_id,
				'game_state': self.game_state
			}))
			self.is_game_running = False
			self.results.status = 'finished'
			self.results.save()


	def _update_game_state(self):
		self.__check_for_collisions()
		self.__check_paddle_collisions()
		self.__move_ball()
		self.__check_win_conditions()

	def move(self, player_index: int, move: str):
		if player_index not in [0, 1]:
			raise ValueError('Invalid player index.')
		if move not in ['up', 'down']:
			raise ValueError('Invalid move.')
		if move == 'up':
			self.game_state[f'paddle_{player_index + 1}_position'] -= PLAYER_SPEED
		elif move == 'down':
			self.game_state[f'paddle_{player_index + 1}_position'] += PLAYER_SPEED