from game_base.consumers import TournamentBaseConsumer
from pong.handlers import PongTournamentHandler

class PongTournamentConsumer(TournamentBaseConsumer):
	_subtype = 'Pong'
