from django.urls import path # type: ignore
from .consumers import PongConsumer, PongTournamentConsumer

pong_ws_urlpatterns = [
	path('ws/pong/', PongConsumer.as_asgi()),
	path('ws/pong/<str:game_id>/', PongConsumer.as_asgi()),
	path('ws/tournament/<str:tournament_id>/', PongTournamentConsumer.as_asgi()),
	path('ws/tournament/', PongTournamentConsumer.as_asgi()),
]