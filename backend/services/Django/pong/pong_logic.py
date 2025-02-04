import time
from game_manager.game_logic import GameHandlerBase

class PongHandler(GameHandlerBase):
	required_players = 2

	def __init__(self, game_id: str):
		super().__init__(game_id)
		self.game_type = 'pong'
		self.game_state = {
			'ball_position': [0, 0],
			'ball_velocity': [1, 1],
			'paddle_1_position': 0,
			'paddle_2_position': 0,
		}

	def run_game(self):
		target_fps = 60
		target_frame_duration = 1 / target_fps

		while self.is_game_running:
			start_time = time.time()

			self.update_game_state()
			self.send_game_state()

			elapsed_time = time.time() - start_time
			sleep_time = max(0, target_frame_duration - elapsed_time)
			time.sleep(sleep_time)

	def update_game_state(self):
		# Update ball position
		self.game_state['ball_position'][0] += self.game_state['ball_velocity'][0]
		self.game_state['ball_position'][1] += self.game_state['ball_velocity'][1]
		# Check for collisions and update velocities
		# (Add your collision detection and response logic here)

	def move(self, player_index: int, move: str):
		if player_index not in [0, 1]:
			raise ValueError('Invalid player index.')
		if move not in ['up', 'down']:
			raise ValueError('Invalid move.')
		if move == 'up':
			self.game_state[f'paddle_{player_index + 1}_position'] -= 1
		elif move == 'down':
			self.game_state[f'paddle_{player_index + 1}_position'] += 1