from .models import PongTournamentModel
from game_base.views import OpenTournamentListView, TournamentListView, TournamentDetailView
from django.urls import path, include # type: ignore

open_tournament_view = OpenTournamentListView.as_view(tournament_model=PongTournamentModel)
user_tournament_view = TournamentListView.as_view(tournament_model=PongTournamentModel)
tournament_detail_view = TournamentDetailView.as_view(tournament_model=PongTournamentModel)

tournament_patterns	= [
	path('list/', user_tournament_view, name='list'),
	path('open/', open_tournament_view, name='open'),
	path('<int:pk>/', tournament_detail_view, name='detail'),
]

match_patterns = [

]

urlpatterns = [
	path('tournament/', include((tournament_patterns, 'tournament'), namespace='tournament')),
	path('match/', include((match_patterns, 'match'), namespace='match')),
]