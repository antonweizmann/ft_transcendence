from rest_framework import status, generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from player.serializers import PlayerSerializer
from player.models import Player

class PlayerListCreateView(generics.ListCreateAPIView):
	queryset = Player.objects.all()
	serializer_class = PlayerSerializer

	def get_queryset(self):
		queryset = super().get_queryset()
		username = self.request.query_params.get('username', None)
		if username is not None:
			queryset = queryset.filter(username__icontains=username)
		return queryset

class PlayerDetailView(APIView):
	permission_classes = [IsAuthenticated]

	def get(self, request, pk):
		try:
			player = Player.objects.get(pk=pk)
		except Player.DoesNotExist:
			return Response(status=status.HTTP_404_NOT_FOUND)
		serializer = PlayerSerializer(player)
		return Response(serializer.data)

	def put(self, request, pk):
		try:
			player = Player.objects.get(pk=pk)
		except Player.DoesNotExist:
			return Response(status=status.HTTP_404_NOT_FOUND)
		serializer = PlayerSerializer(player, data=request.data)
		if serializer.is_valid():
			serializer.save()
			return Response(serializer.data)
		return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

	def delete(self, request, pk):
		try:
			player = Player.objects.get(pk=pk)
		except Player.DoesNotExist:
			return Response(status=status.HTTP_404_NOT_FOUND)
		player.delete()
		return Response(status=status.HTTP_204_NO_CONTENT)