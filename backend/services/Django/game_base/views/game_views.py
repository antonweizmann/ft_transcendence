from rest_framework import generics # type: ignore
from rest_framework.permissions import IsAuthenticated # type: ignore
from ..serializers import GameSerializer
from ..models import GameBaseModel

class GameListView(generics.ListAPIView):
	permission_classes = [IsAuthenticated]
	game_model: type[GameBaseModel] = None
	status_filter: str | None = 'finished'

	def get_serializer_class(self):
		if self.game_model is None:
			raise ValueError('game_model is required')
		GameSerializer.Meta.model = self.game_model
		return GameSerializer

	def get_queryset(self):
		if self.game_model is None:
			raise ValueError('game_model is required')

		self.game_model.objects.filter(players__isnull=True).delete()

		queryset = self.game_model.objects.filter(status=self.status_filter)
		username = self.request.query_params.get('username', None)
		if username is not None:
			queryset = queryset.filter(players__username__iexact=username)
		return queryset

class GameDetailView(generics.RetrieveAPIView):
	permission_classes = [IsAuthenticated]
	game_model: type[GameBaseModel] = None

	def get_queryset(self):
		if self.game_model is None:
			raise ValueError('game_model is required')
		return self.game_model.objects.all()

	def get_serializer_class(self):
		if self.game_model is None:
			raise ValueError('game_model is required')
		GameSerializer.Meta.model = self.game_model
		return GameSerializer