from rest_framework import serializers # type: ignore

class MatchScoreSerializer(serializers.Serializer):
	p1id = serializers.IntegerField()
	p2id = serializers.IntegerField()
	p1score = serializers.IntegerField()
	p2score = serializers.IntegerField()