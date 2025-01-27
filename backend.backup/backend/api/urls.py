from django.urls import path
from . import views
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
	path('users/', views.getData),
	path('register/', views.CreateUserView.as_view(), name='Register'),
	path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
	path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]