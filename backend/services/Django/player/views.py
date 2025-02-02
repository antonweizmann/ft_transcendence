from rest_framework import status, generics # type: ignore
from rest_framework.views import APIView # type: ignore
from rest_framework.response import Response # type: ignore
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly # type: ignore
from rest_framework.parsers import MultiPartParser, FormParser # type: ignore
from rest_framework.decorators import api_view, permission_classes # type: ignore
from player.serializers import PlayerSerializer, PublicPlayerSerializer
from player.models import Player

class PlayerListView(generics.ListAPIView):
	queryset = Player.objects.all()
	permission_classes = [IsAuthenticatedOrReadOnly]

	def get_serializer_class(self):
		try:
			auth_user = Player.objects.get(pk=self.request.user.pk)
		except Player.DoesNotExist:
			return PublicPlayerSerializer
		if auth_user.is_staff:
			return PlayerSerializer
		return PublicPlayerSerializer

	def get_queryset(self):
		queryset = super().get_queryset()
		username = self.request.query_params.get('username', None)
		if username is not None:
			queryset = queryset.filter(username__icontains=username)
		return queryset

class PlayerRegisterView(generics.CreateAPIView):
	parser_classes = (MultiPartParser, FormParser)
	queryset = Player.objects.all()
	serializer_class = PlayerSerializer

def get_user_and_target(user_id, target_id):
	try:
		auth_user = Player.objects.get(pk=user_id)
		target_player = Player.objects.get(pk=target_id)
		return auth_user, target_player
	except Player.DoesNotExist:
		return None, None

class PlayerDetailView(APIView):
	permission_classes = [IsAuthenticated]
	parser_classes = (MultiPartParser, FormParser)

	def get(self, request, pk):
		auth_user, target_player = get_user_and_target(request.user.pk, pk)

		if auth_user is None or target_player is None:
			return Response(status=status.HTTP_404_NOT_FOUND)
		if auth_user != target_player and not auth_user.is_staff:
			serializer = PublicPlayerSerializer(target_player)
		else:
			serializer = PlayerSerializer(target_player)
		return Response(serializer.data)

	def put(self, request, pk):
		auth_user, target_player = get_user_and_target(request.user.pk, pk)

		if auth_user is None or target_player is None:
			return Response({
				'detail': 'Player not found.'},
				status=status.HTTP_404_NOT_FOUND)
		if auth_user != target_player and not auth_user.is_staff:
			return Response({
				'detail': 'You can only update your own account.'},
				status=status.HTTP_403_FORBIDDEN)
		serializer = PlayerSerializer(target_player, data=request.data, partial=True)
		if serializer.is_valid():
			serializer.save()
			return Response(serializer.data, status=status.HTTP_200_OK)
		return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

	def delete(self, request, pk):
		auth_user, target_player = get_user_and_target(request.user.pk, pk)

		if auth_user is None or target_player is None:
			return Response(status=status.HTTP_404_NOT_FOUND)
		if auth_user != target_player and not auth_user.is_staff:
			return Response({
				'detail': 'You can only delete your own account.'},
				status=status.HTTP_403_FORBIDDEN)
		target_player.delete()
		return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_friend_request(request, pk):
	auth_user, target_player = get_user_and_target(request.user.pk, pk)

	if auth_user is None or target_player is None:
		return Response(status=status.HTTP_404_NOT_FOUND)
	if target_player in auth_user.friends.all():
		return Response({
			'detail': f'You are already friends with {target_player.username}.'},
			status=status.HTTP_400_BAD_REQUEST)
	if target_player is auth_user:
		return Response({
			'detail': 'You cannot befriend yourself.'},
			status=status.HTTP_400_BAD_REQUEST)
	if target_player in auth_user.friend_requests.all():
		return Response({
			'detail': f'You have already sent a friend request to {target_player.username}.'},
			status=status.HTTP_400_BAD_REQUEST)
	if target_player in auth_user.friend_requests_received.all():
		return accept_friend_request(request._request, pk)
	auth_user.friend_requests.add(target_player)
	return Response({
		'detail': f'Friend request sent to {target_player.username}.'},
		status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def accept_friend_request(request, pk):
	auth_user, target_player = get_user_and_target(request.user.pk, pk)

	if auth_user is None or target_player is None:
		return Response(status=status.HTTP_404_NOT_FOUND)
	if target_player is auth_user:
		return Response({
			'detail': 'You can not ask yourself for friendship.'},
			status=status.HTTP_400_BAD_REQUEST)
	if target_player not in auth_user.friend_requests_received.all():
		return Response({
			'detail': f'You have not received a friend request from {target_player.username}.'},
			status=status.HTTP_400_BAD_REQUEST)
	auth_user.friend_requests_received.remove(target_player)
	auth_user.friends.add(target_player)
	return Response({
		'detail': f'You are now friends with {target_player.username}.'},
		status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def reject_friend_request(request, pk):
	auth_user, target_player = get_user_and_target(request.user.pk, pk)

	if auth_user is None or target_player is None:
		return Response(status=status.HTTP_404_NOT_FOUND)
	if target_player is auth_user:
		return Response({
			'detail': 'You should not reject yourself.'},
			status=status.HTTP_400_BAD_REQUEST)
	if target_player not in auth_user.friend_requests_received.all():
		return Response({
			'detail': 'You have not received a friend request from this player.'},
			status=status.HTTP_400_BAD_REQUEST)
	auth_user.friend_requests_received.remove(target_player)
	return Response({
		'detail': f'You have rejected the friend request from {target_player.username}.'},
		status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def unfriend(request, pk):
	auth_user, target_player = get_user_and_target(request.user.pk, pk)

	if auth_user is None or target_player is None:
		return Response(status=status.HTTP_404_NOT_FOUND)
	if target_player is auth_user:
		return Response({
			'detail': 'You cannot unfriend yourself.'},
			status=status.HTTP_400_BAD_REQUEST)
	if target_player not in auth_user.friends.all():
		return Response({
			'detail': f'You are not friends with {target_player.username}.'},
			status=status.HTTP_400_BAD_REQUEST)
	auth_user.friends.remove(target_player)
	return Response({
		'detail': f'You are no longer friends with {target_player.username}.'},
		status=status.HTTP_200_OK)