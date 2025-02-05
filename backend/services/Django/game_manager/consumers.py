import json

from asgiref.sync import async_to_sync # type: ignore
from channels.generic.websocket import WebsocketConsumer # type: ignore
from django.contrib.auth import get_user_model # type: ignore
from game_manager.managers import GameManager
from game_manager.game_logic import GameHandlerBase

Player = get_user_model()

class WSConsumerBase(WebsocketConsumer):
	class Meta:
		abstract = True

	def __init__(self, *args, **kwargs):
		super().__init__(*args, **kwargs)
		self.game_handler: type[GameHandlerBase]
		self.game_manager = GameManager()
		self.game_id = None
		self.player = None
		self.player_index = None
		self.in_Match = False

	def send_to_group(self, message, error: bool = False) -> None:
		if error:
			self.send(json.dumps(message))
			return
		async_to_sync(self.channel_layer.group_send)(self.game_id, {
			'type': 'group.message',
			'message': message
		})

	def group_message(self, event):
		message = event['message']
		self.send(text_data=json.dumps(message))

	def _join_lobby(self, player, game_id, game_handler: type[GameHandlerBase]):
		if self.in_Match:
			self.send(json.dumps({
				'message': 'You are already in a match.'
			}))
			return
		self.player = player
		self.game_id = game_id
		self.game_handler = self.game_manager.get_game(game_handler, game_id)
		try:
			async_to_sync(self.channel_layer.group_add)(game_id, self.channel_name)
		except TypeError as e:
			self.send(json.dumps({'error': str(e)}))
			return
		self.player_index = self.game_handler.join_match(player,
			self.send_to_group)
		if self.player_index is None:
			self.send(json.dumps({
				'message': 'Failed to join lobby.'
			}))
			async_to_sync(self.channel_layer.group_discard)(game_id,
				self.channel_name)
			return
		self.in_Match = True

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

		elif action == 'start_game':
			if not self.game_handler:
				self.send(json.dumps({'message': 'You are not in a game.'}))
				return
			try:
				self.game_handler.start_game(self.player_index)
			except ValueError as e:
				self.send(json.dumps({'message': str(e)}))

		elif action == 'move':
			move = text_data_json.get('move')
			if not self.game_handler:
				self.send(json.dumps({'message': 'You are not in a game.'}))
				return
			self.send(json.dumps({
				'message': f'Move: {move}, Player index: {self.player_index}'
			}))
			try:
				self.game_handler.move(self.player_index, move)
			except ValueError as e:
				self.send(json.dumps({'message': str(e)}))

		else:
			message = text_data_json.get('message')
			self.send(json.dumps({
				'message': message
			}))

	def disconnect(self, close_code):
		if self.game_handler:
			async_to_sync(self.channel_layer.group_discard)(self.game_id, self.channel_name)
			self.game_handler.leave_match(self.player)
			if len(self.game_handler.players) == 0 and self.game_id:
				self.game_manager.remove_game(self.game_id)

	def join_lobby(self, player, game_id):
		raise NotImplementedError('You must implement this method in the child'
							+ ' class to specify the game handler.')
		return self._join_lobby(player, game_id, GameHandlerBase)