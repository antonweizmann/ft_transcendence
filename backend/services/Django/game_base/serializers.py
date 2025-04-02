from rest_framework import serializers # type: ignore
from game_base.models import TournamentBaseModel, GameBaseModel

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

class GameSerializer(serializers.ModelSerializer):
	players = serializers.SerializerMethodField()
	tournament = serializers.SerializerMethodField()

	class Meta:
		fields = '__all__'

	def __init__(self, *args, **kwargs):
		super().__init__(*args, **kwargs)

	def get_players(self, obj: GameBaseModel) -> list:
		return [player.username for player in obj.players.all()]

	def get_tournament(self, obj: GameBaseModel) -> str:
		if obj.tournament is None:
			return None
		return {"name": obj.tournament.name, "id": obj.tournament.id}