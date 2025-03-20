from rest_framework import generics # type: ignore
from rest_framework.permissions import IsAuthenticated # type: ignore
from .serializers import TournamentSerializer
from .models import TournamentBaseModel

class OpenTournamentListView(generics.ListAPIView):
	permission_classes = [IsAuthenticated]
	tournament_model: type[TournamentBaseModel] = None

	def __init__(self, *args, **kwargs):
		super().__init__(*args, **kwargs)
		if self.tournament_model is None:
			raise ValueError('tournament_model is required')
		self.queryset = self.tournament_model.objects.filter(status='waiting')

	def get_serializer_class(self):
		class DynamicTournamentSerializer(TournamentSerializer):
			class Meta(TournamentSerializer.Meta):
				model = self.tournament_model
		return DynamicTournamentSerializer

	def get_queryset(self):
		queryset = super().get_queryset()
		name = self.request.query_params.get('name', None)
		if name is not None:
			queryset = queryset.filter(name__icontains=name)
		return queryset
