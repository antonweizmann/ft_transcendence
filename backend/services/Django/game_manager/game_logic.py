import json
import threading
import inspect

class GameHandlerBase:
	class Meta:
		abstract = True

	required_players = 1

	@classmethod
	def _create(cls, game_id: str):
		return cls(game_id)

	def __new__(cls, *args, **kwargs):
		stack = inspect.stack()
		try:
			caller = stack[2].function
		except IndexError:
			caller = ''
		if caller != 'get_game':
			raise TypeError("Instances of any GameHandler can only be "\
					"created using the GameManager.get_game().")
		return super(GameHandlerBase, cls).__new__(cls)

	def __init__(self, game_id: str, game_type: str):
		self.is_game_running = False
		self.send_func = None
		self.game_type = game_type
		self.game_id = game_id
		self.game_state = {}
		self.players = []

	def join_match(self, player, send_func):
		if not self.allowed_to_join(player, send_func):
			return
		self.players.append(player)
		self.send_func = send_func
		player_index = len(self.players) - 1
		send_func(json.dumps({
			'type': 'lobby_update',
			'game_id': self.game_id,
			'players': [{'username': player.username, 'index': index} for\
				index, player in enumerate(self.players)]
		}))
		return player_index

	def leave_match(self, player):
		if player not in self.players:
			return
		self.players.remove(player)
		self.send_func(json.dumps({
			'type': 'lobby_update',
			'game_id': self.game_id,
			'players': [{'username': player.username, 'index': index} for\
				index, player in enumerate(self.players)]
		}))
		if len(self.players) == 0:
			self.is_game_running = False

	def start_game(self, player_index):
		if self.send_func is None or player_index == None:
			raise ValueError('You must join a match before starting the game.')
		if self.required_players != len(self.players):
			self.send_func(json.dumps({
				'type': 'error',
				'message': 'Waiting for other players to join.'
			}))
			return
		self.is_game_running = True
		game_thread = threading.Thread(target=self.run_game)
		game_thread.start()

	def send_game_state(self):
		if self.send_func is None:
			raise ValueError('You must join a match before sending game state.')
		self.send_func(json.dumps({
			'type': f'{self.game_type}_update',
			'game_id': self.game_id,
			'game_state': self.game_state
		}))

	def allowed_to_join(self, player, send_func):
		if self.is_game_running:
			send_func(json.dumps({
				'type': 'error',
				'message': 'Game has already started.'
			}), True)
			return False
		if player in self.players:
			send_func(json.dumps({
				'type': 'error',
				'message': 'Player already joined.'
			}), True)
			return False
		if len(self.players) >= self.required_players:
			send_func(json.dumps({
				'type': 'error',
				'message': 'Game lobby is full.'
			}), True)
			return False
		return True

	def run_game(self):
		raise NotImplementedError

	def update_game_state(self):
		raise NotImplementedError

	def move(self, player_index, move):
		raise NotImplementedError
