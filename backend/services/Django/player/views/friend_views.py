from rest_framework.decorators import api_view, permission_classes # type: ignore
from rest_framework.permissions import IsAuthenticated # type: ignore
from rest_framework.response import Response # type: ignore
from rest_framework import status # type: ignore
from .utils import get_user_and_target

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