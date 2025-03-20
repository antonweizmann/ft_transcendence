from rest_framework import serializers # type: ignore
from game_base.models import TournamentBaseModel

class TournamentSerializer(serializers.ModelSerializer):
	player_count = serializers.SerializerMethodField()
	players = serializers.SerializerMethodField()

	class Meta:
		fields = '__all__'

	def __init__(self, *args, **kwargs):
		super().__init__(*args, **kwargs)

	def get_player_count(self, obj: TournamentBaseModel) -> int:
		return obj.players.count()

	def get_players(self, obj: TournamentBaseModel) -> list:
		return [player.username for player in obj.players.all()]
