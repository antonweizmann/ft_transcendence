import time
from game_manager.game_logic import GameHandlerBase

class PongHandler(GameHandlerBase):
	required_players = 2

	def __init__(self, game_id: str):
		super().__init__(game_id, 'pong')
		self.game_state = {
			'ball_position': [0, 0],
			'ball_velocity': [1, 1],
			'paddle_1_position': 0,
			'paddle_2_position': 0,
		}

	def run_game(self):
		target_fps = 60
		target_frame_duration = 1 / target_fps

		while self.game_running:
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

	def move_paddle(self, player: int, up_or_down: str):
		if up_or_down not in ['up', 'down']:
			return
		direction = 1 if up_or_down == 'up' else -1
		if player == 1:
			self.game_state['paddle_1_position'] += direction
		elif player == 2:
			self.game_state['paddle_2_position'] += direction
		else:
			raise ValueError('Invalid player number')