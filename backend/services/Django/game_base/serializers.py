from rest_framework import serializers # type: ignore
from game_base.models import TournamentBaseModel

class TournamentSerializer(serializers.ModelSerializer):

	def __init__(self, *args, **kwargs):
		super().__init__(*args, **kwargs)

	class Meta:
		fields = '__all__'
