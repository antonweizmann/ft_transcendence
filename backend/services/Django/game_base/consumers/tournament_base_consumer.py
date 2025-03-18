import json

from game_base.managers import TournamentManager
from game_base.handlers import TournamentHandlerBase
from .core_base_consumer import CoreBaseConsumer

class TournamentBaseConsumer(CoreBaseConsumer):
	class Meta:
		abstract = True

	_type		= 'Tournament'
	_subtype	= 'Base'

	def __init__(self, *args, **kwargs):
		super().__init__(*args, **kwargs)
		self._handler: type[TournamentHandlerBase] | None	= None
		self._manager										= TournamentManager()

	def receive(self, text_data):
		text_data_json, action = super().receive(text_data)

		if action == None:
			return

		else:
			message = text_data_json.get('message')
			self.send(json.dumps({
				'message': message
			}))