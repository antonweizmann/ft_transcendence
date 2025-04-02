from django.urls import path, include # type: ignore
from .models import PongTournamentModel, PongGameModel
from game_base.views import (
	TournamentListView,
	TournamentDetailView,
	GameListView,
	GameDetailView,
)

open_tournament_view = TournamentListView.as_view(status_filter='waiting', tournament_model=PongTournamentModel)
tournament_view = TournamentListView.as_view(tournament_model=PongTournamentModel)
tournament_detail_view = TournamentDetailView.as_view(tournament_model=PongTournamentModel)

open_game_view = GameListView.as_view(status_filter='waiting', game_model=PongGameModel)
game_view = GameListView.as_view(game_model=PongGameModel)
game_detail_view = GameDetailView.as_view(game_model=PongGameModel)

tournament_patterns	= [
	path('list/', tournament_view, name='list'),
	path('open/', open_tournament_view, name='open'),
	path('<int:pk>/', tournament_detail_view, name='detail'),
]

match_patterns = [
	path('list/', game_view, name='list'),
	path('open/', open_game_view, name='open'),
	path('<int:pk>/', game_detail_view, name='detail'),
]

urlpatterns = [
	path('tournament/', include((tournament_patterns, 'tournament'), namespace='tournament')),
	path('match/', include((match_patterns, 'match'), namespace='match')),
]