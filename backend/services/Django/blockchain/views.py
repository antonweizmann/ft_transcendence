from rest_framework.views import APIView # type: ignore
from rest_framework.response import Response
from rest_framework.decorators import api_view
from web3 import Web3
from .serializers import MatchScoreSerializer
from .contracts import contract

@api_view(['GET'])
def get_blockchain_scores(request):
	try:
		total_matches = contract.functions.getTotalMatches().call()

		matches = []

		for i in range(total_matches):
			match_id = contract.functions.getMatchIndex(i).call()
			player_one_id, player_two_id, player_one_score, player_two_score = contract.functions.getMatchScore(match_id).call()
			match_data = {
				'match_id': match_id,
				'player_one_id': player_one_id,
				'player_two_id': player_two_id,
				'player_one_score': player_one_score,
				'player_two_score': player_two_score
			}
			matches.append(match_data)

		serializer = MatchScoreSerializer(matches, many=True)

		return Response(serializer.data)
	except Exception as e:
		return Response({'error': str(e)}, status=500)