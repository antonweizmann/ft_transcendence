import json

from game_base.managers import tournament_manager
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
		self._manager										= tournament_manager

	def receive(self, text_data):
		text_data_json, action = super().receive(text_data)

		if action == None:
			return

		if action == 'change_size':
			size = text_data_json.get('size')
			try:
				if (isinstance(size, int) == False and
					isinstance(size, str) == False):
					raise ValueError('Tournament size is not an integer.')
				if (isinstance(size, str) == True):
					if (size.isdigit() == False):
						raise ValueError('Tournament size is not a number.')
					size = int(size)
				if (size is None or size < 3 or size > 8):
					raise ValueError('Tournament size must be between 3 and 8.')
				size = int(size)
				self._handler.set_tournament_size(size)
			except ValueError as e:
				self.send(json.dumps({
					'type': 'error',
					'details': f'Tournament size error: {e}'
				}))

		elif action == 'change_description':
			description = text_data_json.get('description')
			self._handler.set_description(description)
			self.send(json.dumps({
				'message': f'Tournament description changed to {description}.'
			}))

		elif action == 'change_name':
			name = text_data_json.get('name')
			self._handler.set_name(name)
			self.send(json.dumps({
				'message': f'Tournament name changed to {name}.'
			}))

		else:
			message = text_data_json.get('message')
			self.send(json.dumps({
				'message': message
			}))