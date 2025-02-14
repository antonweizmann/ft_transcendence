import json

from asgiref.sync import async_to_sync # type: ignore
from channels.generic.websocket import WebsocketConsumer # type: ignore
from channels.exceptions import StopConsumer # type: ignore
from django.contrib.auth import get_user_model # type: ignore
from game_base.managers.manager_base import ManagerBase
from game_base.handlers.core_base_handler import CoreHandlerBase

Player = get_user_model()

class CoreBaseConsumer(WebsocketConsumer):
	class Meta:
		abstract = True

	_type		= 'core'
	_subtype	= 'abstract'

	def __init__(self, *args, **kwargs):
		super().__init__(*args, **kwargs)
		self._handler: type[CoreHandlerBase] | None	= None
		self._manager: type[ManagerBase] | None 	= None
		self._id: str								= None
		self.player: Player							= None # type: ignore
		self.player_index: int						= None
		self._already_in: bool						= False

	def connect(self):
		super().connect()
		self.send(json.dumps({
			'message': f'Connected to {self._subtype} {self._type} server.'
		}))

	def _send_to_group(self, message, error: bool = False) -> None:
		try:
			if error:
				self.send(json.dumps(message))
				return
			async_to_sync(self.channel_layer.group_send)(self._id, {
				'type': 'group.message',
				'message': message
			})
		except Exception as e:
			print("Error sending message to group:", e)
			raise StopConsumer()

	def group_message(self, event):
		message = event['message']
		self.send(text_data=json.dumps(message))

	def _set_handler(self, object_id, handler: type[CoreHandlerBase]):
		if self._already_in:
			self.send(json.dumps({
				'message': f'You are already in a {self._subtype} {self._type}.'
			}))
			return
		try:
			async_to_sync(self.channel_layer.group_add)(object_id, self.channel_name)
		except TypeError as e:
			self.send(json.dumps({'error': str(e)}))
			return
		self._id = object_id
		self._handler = self._manager._get_object(handler, object_id)

	def receive(self, text_data):
		text_data_json = json.loads(text_data)
		action = text_data_json.get('action')
		player_pk = text_data_json.get('player_pk')
		object_id = text_data_json.get(f'{self._type}_id')

		if action == 'join_lobby':
			try:
				player_pk = int(player_pk)
				self.player = Player.objects.get(pk=player_pk)
				if self.player == None:
					raise Player.DoesNotExist
			except Player.DoesNotExist:
				self.send(json.dumps({'message': 'Player not found.'}))
				return
			except ValueError as e:
				self.send(json.dumps({'message': 'Invalid player ID.'}))
				return
			self.join_lobby(self.player, object_id)

		else:
			message = text_data_json.get('message')
			self.send(json.dumps({
				'message': message
			}))

	def disconnect(self, close_code):
		if self._handler:
			async_to_sync(self.channel_layer.group_discard)(self._id, self.channel_name)
			self._handler.leave_match(self.player)
			if len(self._handler.players) == 0 and self._id:
				self._manager.remove_game(self._id)

	def join_lobby(self, player, _id):
		raise NotImplementedError('You must implement this method in the child'
							+ ' class to specify the game handler.')
		return self._join_lobby(player, _id, GameHandlerBase)