from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView # type: ignore
from rest_framework import status # type: ignore
from rest_framework.response import Response # type: ignore
from rest_framework.views import APIView # type: ignore
from django.contrib.auth import get_user_model # type: ignore
from django.utils.timezone import now # type: ignore

Player = get_user_model()

class PlayerTokenObtainPairView(TokenObtainPairView):
	def post(self, request, *args, **kwargs):
		serializer = self.get_serializer(data=request.data)

		try:
			serializer.is_valid(raise_exception=True)
		except Exception as e:
			return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

		token_data = serializer.validated_data
		additional_data = {
			"detail": "Login successful",
			"username": serializer.user.username,
		}
		response = Response(additional_data, status=status.HTTP_200_OK)
		response.set_cookie(
			key='refresh_token',
			value=token_data['refresh'],
			max_age=60 * 60 * 24 * 3,
			httponly=True,
			samesite='Strict',
			secure=True,
		)
		response.set_cookie(
			key='access_token',
			value=token_data['access'],
			max_age=60 * 5,
			httponly=True,
			samesite='Strict',
			secure=True,
		)
		response.set_cookie(
			key='user_id',
			value=serializer.user.id,
			max_age=60 * 60 * 24 * 3,
			httponly=False,
			samesite='Strict',
			secure=True,
		)
		return response

class PlayerTokenRefreshView(TokenRefreshView):
	def post(self, request, *args, **kwargs):
		refresh_token = request.COOKIES.get('refresh_token')
		if not refresh_token:
			return Response({"detail": "Refresh token not found"}, status=status.HTTP_400_BAD_REQUEST)
		serializer = self.get_serializer(data={"refresh": refresh_token})
		try:
			serializer.is_valid(raise_exception=True)
		except Exception as e:
			return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

		user_id = request.COOKIES.get('user_id')
		try:
			player = Player.objects.get(id=user_id)
			player.last_login = now()
			player.save()
		except Player.DoesNotExist:
			return Response({"detail": f"User {user_id} not found."}, status=status.HTTP_404_NOT_FOUND)
		response = Response({"detail": "Token refreshed successfully"}, status=status.HTTP_200_OK)
		response.set_cookie(
			key='access_token',
			value=serializer.validated_data['access'],
			max_age=60 * 5,
			httponly=True,
			samesite='Strict',
			secure=True,
		)
		return response

class PlayerLogOutView(APIView):
	def post(self, request, *args, **kwargs):
		response = Response({"detail": "Logged out successfully"}, status=status.HTTP_200_OK)
		response.delete_cookie('refresh_token')
		response.delete_cookie('access_token')
		response.delete_cookie('user_id')
		return response
