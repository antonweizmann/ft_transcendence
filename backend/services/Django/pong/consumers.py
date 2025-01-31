import json
from channels.generic.websocket import WebsocketConsumer # type: ignore
from player.models import Player

class PongConsumer(WebsocketConsumer):
	player_1 = None
	player_2 = None

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
				self.send(text_data=json.dumps({'message': 'Player not found.'}))
				self.close()
		else:
			message = text_data_json.get('message')
			self.send(text_data=json.dumps({
				'message': message
			}))

	def assign_player(self, player):
		if not self.player_1:
			self.player_1 = player
			self.scope['player'] = player
		elif not self.player_2:
			self.player_2 = player
			self.scope['player'] = player
		else:
			self.send(text_data=json.dumps({'message': 'Game is full.'}))
			self.close()
			return False
		return True

	def log_join(self, player):
		self.send(text_data=json.dumps({
			'message': f'{player.username} connected.'}))
		if not self.player_1 or not self.player_2:
			self.send(text_data=json.dumps({
				'message': 'Waiting for other player.'}))