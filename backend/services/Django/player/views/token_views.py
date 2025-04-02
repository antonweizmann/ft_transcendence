from rest_framework_simplejwt.views import TokenObtainPairView # type: ignore
from rest_framework import status # type: ignore
from rest_framework.response import Response # type: ignore

class PlayerTokenObtainPairView(TokenObtainPairView):
	def post(self, request, *args, **kwargs):
		serializer = self.get_serializer(data=request.data)

		try:
			serializer.is_valid(raise_exception=True)
		except Exception as e:
			return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

		token_data = serializer.validated_data
		additional_data = {
			"user_id": serializer.user.id,
			"username": serializer.user.username,
		}
		response_data = {**token_data, **additional_data}
		return Response(response_data, status=status.HTTP_200_OK)
