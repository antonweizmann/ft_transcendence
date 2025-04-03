from rest_framework import serializers # type: ignore

class MatchScoreSerializer(serializers.Serializer):
	match_id = serializers.IntegerField()
	player_one_id = serializers.IntegerField()
	player_two_id = serializers.IntegerField()
	player_one_score = serializers.IntegerField()
	player_two_score = serializers.IntegerField()