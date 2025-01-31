import json
from channels.generic.websocket import WebsocketConsumer # type: ignore
from player.models import Player
from pong.game_logic import GameLogic

class PongConsumer(WebsocketConsumer):
	def __init__(self, *args, **kwargs):
		super().__init__(*args, **kwargs)
		self.game_logic = GameLogic()
		self.player_1 = None
		self.player_2 = None

	def connect(self):
		self.accept()

	def disconnect(self, close_code):
		if self.player_1 == self.scope.get('player'):
			self.player_1 = None
		elif self.player_2 == self.scope.get('player'):
			self.player_2 = None

	def receive(self, text_data):
		text_data_json = json.loads(text_data)
		action = text_data_json.get('action')
		player_pk = text_data_json.get('player_pk')

		if action == 'join_match' and player_pk:
			try:
				player = Player.objects.get(pk=player_pk)
				if not self.assign_player(player):
					return
				self.log_join(player)
			except Player.DoesNotExist:
				self.send(json.dumps({'message': 'Player not found.'}))
				self.close()
		elif action == 'move_paddle':
			if not self.player_1 or not self.player_2:
				self.send(json.dumps({'message': 'Waiting for other player.'}))
				return
			if self.player_1 == self.scope.get('player'):
				player_number = 1
			elif self.player_2 == self.scope.get('player'):
				player_number = 2
			self.move_paddle(player_number, text_data_json.get('position'))
		elif action == 'start_game':
			if not self.player_1 or not self.player_2:
				self.send(json.dumps({'message': 'Waiting for other player.'}))
				return
			self.game_logic.start_game()
		else:
			message = text_data_json.get('message')
			self.send(json.dumps({
				'message': message
			}))

	def assign_player(self, player):
		if self.player_1 == player or self.player_2 == player:
			self.send(json.dumps({'message': 'You are already in the game.'}))
			self.close()
			return False
		if not self.player_1:
			self.player_1 = player
			self.scope['player'] = player
		elif not self.player_2:
			self.player_2 = player
			self.scope['player'] = player
		else:
			self.send(json.dumps({'message': 'Game is full.'}))
			self.close()
			return False
		return True

	def log_join(self, player):
		self.send(json.dumps({
			'message': f'{player.username} connected.'}))
		if not self.player_1 or not self.player_2:
			self.send(json.dumps({
				'message': 'Waiting for other player.'}))