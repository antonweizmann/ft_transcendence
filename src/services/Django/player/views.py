from rest_framework import status, generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
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
		print(auth_user.is_staff, auth_user)
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
	queryset = Player.objects.all()
	serializer_class = PlayerSerializer

class PlayerDetailView(APIView):
	permission_classes = [IsAuthenticated]

	def get(self, request, pk):
		try:
			auth_user = Player.objects.get(pk=request.user.pk)
			target_player = Player.objects.get(pk=pk)
		except Player.DoesNotExist:
			return Response(status=status.HTTP_404_NOT_FOUND)
		if auth_user != target_player and not auth_user.is_staff:
			serializer = PublicPlayerSerializer(target_player)
		else:
			serializer = PlayerSerializer(target_player)
		return Response(serializer.data)

	def put(self, request, pk):
		try:
			auth_user = Player.objects.get(pk=request.user.pk)
			target_player = Player.objects.get(pk=pk)
			if auth_user != target_player and not auth_user.is_staff:
				return Response({
					'detail': 'You can only update your own account.'},
					status=status.HTTP_403_FORBIDDEN)
		except Player.DoesNotExist:
			return Response({
				'detail': 'Player not found.'},
				status=status.HTTP_404_NOT_FOUND)
		serializer = PlayerSerializer(target_player, data=request.data)
		if serializer.is_valid():
			serializer.save()
			return Response(serializer.data, status=status.HTTP_200_OK)
		return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

	def delete(self, request, pk):
		try:
			auth_user = Player.objects.get(pk=request.user.pk)
			target_player = Player.objects.get(pk=pk)
			if auth_user != target_player and not auth_user.is_staff:
				return Response({
					'detail': 'You can only delete your own account.'},
					status=status.HTTP_403_FORBIDDEN)
		except Player.DoesNotExist:
			return Response(status=status.HTTP_404_NOT_FOUND)
		target_player.delete()
		return Response(status=status.HTTP_204_NO_CONTENT)