from rest_framework_simplejwt.authentication import JWTAuthentication # type: ignore
from django.contrib.auth import get_user_model # type: ignore
from django.utils.timezone import now # type: ignore

Player = get_user_model()

class CookieJWTAuthentication(JWTAuthentication):
	def authenticate(self, request):
		raw_token = request.COOKIES.get('access_token')
		if raw_token is None:
			return None
		validated_token = self.get_validated_token(raw_token)
		user = self.get_user(validated_token)
		if (user
			and (user.last_login is None
				or (now() - user.last_login).total_seconds() > 300)): 
				user.last_login = now()
				user.save(update_fields=['last_login'])
		return user, validated_token