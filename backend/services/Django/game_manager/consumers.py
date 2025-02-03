import json

from asgiref.sync import async_to_sync # type: ignore
from channels.generic.websocket import WebsocketConsumer # type: ignore
from django.contrib.auth import get_user_model # type: ignore
from game_manager.game_logic import GameHandlerBase
from game_manager.managers import GameManager

Player = get_user_model()

class WSConsumerBase(WebsocketConsumer):
	class Meta:
		abstract = True

	def __init__(self, *args, **kwargs):
		super().__init__(*args, **kwargs)
		self.game_handler = None
		self.game_manager = GameManager()
		self.game_id = None
		self.player = None
		self.player_index = None

	def send_to_group(self, message):
		async_to_sync(self.channel_layer.group_send)(self.game_id, {
			'type': 'group.message',
			'message': message
		})

	def group_message(self, event):
		message = event['message']
		self.send(text_data=json.dumps(message))

	def join_lobby(self, player, game_id, game_handler: GameHandlerBase):
		self.player = player
		self.game_id = game_id
		self.game_handler = self.game_manager.get_game(game_handler, game_id)
		async_to_sync(self.channel_layer.group_add)(game_id, self.channel_name)
		self.player_index = self.game_handler.join_match(player,
			self.send_to_group)
		if self.player_index is None:
			self.send(json.dumps({
				'message': 'Failed to join lobby.'
			}))

	def receive(self, text_data):
		text_data_json = json.loads(text_data)
		action = text_data_json.get('action')
		player_pk = text_data_json.get('player_pk')
		game_id = text_data_json.get('game_id')

		if action == 'join_lobby' and player_pk:
			try:
				self.player = Player.objects.get(pk=player_pk)
				self.join_lobby(self.player, game_id)
			except Player.DoesNotExist:
				self.send(json.dumps({'message': 'Player not found.'}))
				self.close()

		elif action == 'start_game':
			if not self.game_handler:
				self.send(json.dumps({'message': 'You are not in a game.'}))
				return
			self.game_handler.start_game()

		elif action == 'move':
			if not self.game_handler:
				self.send(json.dumps({'message': 'You are not in a game.'}))
				return
			move = text_data_json.get('move')
			self.send(json.dumps({
				'message': f'Move: {move}'
			}))
			self.game_handler.move(self.player_index, move)

		else:
			message = text_data_json.get('message')
			self.send(json.dumps({
				'message': message
			}))

	def disconnect(self, close_code):
		if self.game_handler:
			async_to_sync(self.channel_layer.group_discard)(self.game_id, self.channel_name)
			self.game_handler.leave_match(self.player)