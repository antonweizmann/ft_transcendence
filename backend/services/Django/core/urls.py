"""
URL configuration for core project.

The `urlpatterns` list routes URLs to views. For more information please see:
	https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
	1. Add an import:  from my_app import views
	2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
	1. Add an import:  from other_app.views import Home
	2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
	1. Import the include() function: from django.urls import include, path
	2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from rest_framework_simplejwt.views import TokenRefreshView # type: ignore
from django.conf.urls.static import static # type: ignore
from django.contrib import admin # type: ignore
from django.urls import path # type: ignore
from django.conf import settings # type: ignore
from blockchain.views import get_blockchain_scores
from player.views import (
	PlayerDetailView, PlayerListView, PlayerRegisterView, accept_friend_request,
	reject_friend_request, send_friend_request, unfriend, PlayerTokenObtainPairView
	)
from game_base.views import OpenTournamentListView
from pong.models import PongTournamentModel

urlpatterns = [
	path('admin/', admin.site.urls),
	path('api/blockchain/', get_blockchain_scores, name='blockchain_scores'),
	path('api/token/', PlayerTokenObtainPairView.as_view(), name='token_obtain_pair'),
	path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
	path('api/player/list/', PlayerListView.as_view(), name='player_list'),
	path('api/player/register/', PlayerRegisterView.as_view(), name='player_register'),
	path('api/player/<int:pk>/', PlayerDetailView.as_view(), name='player_detail'),
	path('api/player/accept_request/<int:pk>/', accept_friend_request, name='accept_friend_request'),
	path('api/player/reject_request/<int:pk>/', reject_friend_request, name='reject_friend_request'),
	path('api/player/send_request/<int:pk>/', send_friend_request, name='send_friend_request'),
	path('api/player/unfriend/<int:pk>/', unfriend, name='unfriend'),
	path('api/tournament/list/', OpenTournamentListView.as_view(tournament_model=PongTournamentModel), name='tournament_list'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

