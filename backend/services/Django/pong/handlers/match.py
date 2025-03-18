import time
import random
import json
from math import sqrt
from game_base.handlers import GameHandlerBase
from pong.models import PongMatch

X = 0
Y = 1

BOARD_WIDTH = 800.0
BOARD_HEIGHT = 500.0

MIN_BALL_X = 10
MIN_BALL_Y = 10
MAX_BALL_X = BOARD_WIDTH - 10
MAX_BALL_Y = BOARD_HEIGHT - 10
BALL_SPEED = 6.66
INITIAL_BALL_POSITION: list[float, float] = [BOARD_WIDTH / 2, BOARD_HEIGHT / 2]

MIN_PLAYER_Y = 50
MAX_PLAYER_Y = BOARD_HEIGHT - 50
PLAYER_SPEED = 10

class PongHandler(GameHandlerBase):
	_subtype			= 'Pong'
	_required_players	= 2

	def __set_random_ball_direction(self) -> list[int, int]:
		return [random.choice([-1, 1]), random.choice([-1, 1])]

	def __init__(self, game_id: str):
		super().__init__(game_id)
		self._model = PongMatch.objects.create()
		self._state.update({
			'ball_position': INITIAL_BALL_POSITION.copy(),
			'ball_direction': self.__set_random_ball_direction(),
			'paddle_1_position': 250,
			'paddle_2_position': 250,
		})
		self.__ball_speed = BALL_SPEED
		self.__allowed_to_move = False

	def __start_countdown(self):
		i = 0
		for i in range(3, 0, -1):
			self._send_func(json.dumps({
				'message': f'Game starting in {i}...'
			}))
			time.sleep(1)

	def _run_game(self):
		target_fps = 60
		target_frame_duration = 1 / target_fps

		self.__start_countdown()
		self.__allowed_to_move = True
		while self._is_active:
			start_time = time.time()

			self._update_game_state()
			if self._is_active:
				self._send_game_state()

			elapsed_time = time.time() - start_time
			sleep_time = max(0, target_frame_duration - elapsed_time)
			time.sleep(sleep_time)

	def __reset_ball(self):
		self._state['ball_position'] = INITIAL_BALL_POSITION.copy()
		self._state['ball_direction'] = self.__set_random_ball_direction()
		self.__ball_speed = BALL_SPEED

	def __score_goal(self):
		if self._state['ball_position'][X] <= MIN_BALL_X:
			self._state['score'][self.players[1].__str__()] += 1
		elif self._state['ball_position'][X] >= MAX_BALL_X:
			self._state['score'][self.players[0].__str__()] += 1
		self._model.scores = self._state['score']
		self._model.save()

	def __check_for_collisions(self):
		if (self._state['ball_position'][Y] <= MIN_BALL_Y
			or self._state['ball_position'][Y] >= MAX_BALL_Y):
			self._state['ball_direction'][Y] *= -1

		if (self._state['ball_position'][X] <= MIN_BALL_X
			or self._state['ball_position'][X] >= MAX_BALL_X):
			self.__score_goal()
			self.__reset_ball()

	def __bounce_from_paddle(self, paddle_position: float):
		self._state['ball_direction'][X] *= -1
		self._state['ball_direction'][Y] = (
			self._state['ball_position'][Y] - paddle_position) / 50
		if self.__ball_speed < 11:
			self.__ball_speed += 0.66

	def __check_paddle_collisions(self):
		# Paddle 1 collision
		if (self._state['ball_position'][X] <= 20
			and self._state['ball_position'][Y] >= self._state['paddle_1_position'] - 50
			and self._state['ball_position'][Y] <= self._state['paddle_1_position'] + 50):
			self.__bounce_from_paddle(self._state['paddle_1_position'])

		# Paddle 2 collision
		if (self._state['ball_position'][X] >= 780
			and self._state['ball_position'][Y] >= self._state['paddle_2_position'] - 50
			and self._state['ball_position'][Y] <= self._state['paddle_2_position'] + 50):
			self.__bounce_from_paddle(self._state['paddle_2_position'])

	def __move_ball(self):
		magnitude = sqrt(self._state['ball_direction'][X] ** 2
			+ self._state['ball_direction'][Y] ** 2)
		normalized_direction = [self._state['ball_direction'][X] / magnitude,
			self._state['ball_direction'][Y] / magnitude]
		self._state['ball_position'][X] += normalized_direction[X] * BALL_SPEED
		self._state['ball_position'][Y] += normalized_direction[Y] * BALL_SPEED

	def __check_win_conditions(self):
		if (self._state['score'][self.players[1].__str__()] >= 10
				or self._state['score'][self.players[0].__str__()] >= 10):
			self._send_func(json.dumps({
				'type': 'game_over',
				'game_id': self._id,
				'game_state': self._state
			}))
			self._is_active = False
			self._model.status = 'finished'
			self._model.save()


	def _update_game_state(self):
		self.__move_ball()
		self.__check_for_collisions()
		self.__check_paddle_collisions()
		self.__check_win_conditions()

	def move(self, player_index: int, move: str):
		if player_index not in [0, 1]:
			raise ValueError('Invalid player index.')
		if move not in ['up', 'down']:
			raise ValueError('Invalid move.')
		if not self.__allowed_to_move:
			raise ValueError('Game has not started yet.')
		if (move == 'up' and
			self._state[f'paddle_{player_index + 1}_position'] >=
			MIN_PLAYER_Y + PLAYER_SPEED):
			self._state[f'paddle_{player_index + 1}_position'] -= PLAYER_SPEED
		elif move == 'up':
			self._state[f'paddle_{player_index + 1}_position'] = MIN_PLAYER_Y
		elif (move == 'down' and
			self._state[f'paddle_{player_index + 1}_position'] <=
			MAX_PLAYER_Y - PLAYER_SPEED):
			self._state[f'paddle_{player_index + 1}_position'] += PLAYER_SPEED
		else:
			self._state[f'paddle_{player_index + 1}_position'] = MAX_PLAYER_Y