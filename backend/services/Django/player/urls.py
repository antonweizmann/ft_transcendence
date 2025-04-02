from rest_framework_simplejwt.views import TokenRefreshView # type: ignore
from django.urls import path # type: ignore
from .views import (
	PlayerDetailView, PlayerListView, PlayerRegisterView, accept_friend_request,
	reject_friend_request, send_friend_request, unfriend, PlayerTokenObtainPairView
	)

player_patterns = [
	path('list/', PlayerListView.as_view(), name='list'),
	path('register/', PlayerRegisterView.as_view(), name='register'),
	path('<int:pk>/', PlayerDetailView.as_view(), name='detail'),
	path('accept_request/<int:pk>/', accept_friend_request, name='accept_friend_request'),
	path('reject_request/<int:pk>/', reject_friend_request, name='reject_friend_request'),
	path('send_request/<int:pk>/', send_friend_request, name='send_friend_request'),
	path('unfriend/<int:pk>/', unfriend, name='unfriend')
]

token_patterns = [
	path('', PlayerTokenObtainPairView.as_view(), name='obtain_pair'),
	path('refresh/', TokenRefreshView.as_view(), name='refresh')
]

urlpatterns = player_patterns + token_patterns