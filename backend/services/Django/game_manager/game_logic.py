import json
import threading

class GameLogicBase:
	class Meta:
		abstract = True

	def __init__(self, player_ws, game_id: str, game_type: str):
		self.is_game_running = False
		self.game_id = game_id
		self.player_1 = player_ws
		self.game_state = {}
		self.game_type = game_type

	def start_game(self, send_func):
		self.game_running = True
		game_thread = threading.Thread(target=self.run_game, args=(send_func,))
		game_thread.start()
	
	def run_game(self, send_func):
		raise NotImplementedError
	
	def send_game_state(self, send_func):
		send_func(json.dumps({
			'type': f'{self.game_type}_update',
			'game_id': self.game_id,
			'game_state': self.game_state
		}))
