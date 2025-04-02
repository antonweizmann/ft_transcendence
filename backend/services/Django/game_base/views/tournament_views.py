from rest_framework import generics # type: ignore
from rest_framework.permissions import IsAuthenticated # type: ignore
from ..serializers import TournamentSerializer
from ..models import TournamentBaseModel

class TournamentListView(generics.ListAPIView):
	permission_classes = [IsAuthenticated]
	tournament_model: type[TournamentBaseModel] = None
	status_filter: str | None = 'finished'

	def get_serializer_class(self):
		if self.tournament_model is None:
			raise ValueError('tournament_model is required')
		TournamentSerializer.Meta.model = self.tournament_model
		return TournamentSerializer

	def get_queryset(self):
		if self.tournament_model is None:
			raise ValueError('tournament_model is required')
		queryset = self.tournament_model.objects.filter(status=self.status_filter)
		username = self.request.query_params.get('username', None)
		if username is not None:
			queryset = queryset.filter(players__username__iexact=username)
		return queryset

class TournamentDetailView(generics.RetrieveAPIView):
	permission_classes = [IsAuthenticated]
	tournament_model: type[TournamentBaseModel] = None

	def get_queryset(self):
		if self.tournament_model is None:
			raise ValueError('tournament_model is required')
		return self.tournament_model.objects.all()

	def get_serializer_class(self):
		if self.tournament_model is None:
			raise ValueError('tournament_model is required')
		TournamentSerializer.Meta.model = self.tournament_model
		return TournamentSerializer
