import json

from game_base.managers import game_manager
from game_base.handlers import GameHandlerBase
from .core_base_consumer import CoreBaseConsumer

class GameBaseConsumer(CoreBaseConsumer):
	class Meta:
		abstract = True

	_type		= 'Game'
	_subtype	= 'Base'

	def __init__(self, *args, **kwargs):
		super().__init__(*args, **kwargs)
		self._handler: type[GameHandlerBase] | None	= None
		self._manager								= game_manager

	def receive(self, text_data):
		text_data_json, action = super().receive(text_data)

		if action == None:
			return

		if action == 'move':
			move = text_data_json.get('move')
			if not self._handler:
				self.send(json.dumps({'message': 'You are not in a game.'}))
				return
			try:
				self._handler.move(self.player_index, move)
			except ValueError as e:
				self.send(json.dumps({'message': str(e)}))

		else:
			message = text_data_json.get('message')
			self.send(json.dumps({
				'message': message
			}))