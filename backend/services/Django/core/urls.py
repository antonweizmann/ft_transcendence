"""
URL configuration for core project.

The `urlpatterns` list routes URLs to views. For more information please see:
	https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
	1. Add an import:  from my_app import views
	2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
	1. Add an import:  from other_app.views import Home
	2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
	1. Import the include() function: from django.urls import include, path
	2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.conf.urls.static import static # type: ignore
from django.contrib import admin # type: ignore
from django.urls import path, include # type: ignore
from django.conf import settings # type: ignore
from blockchain.views import get_blockchain_scores
from player.urls import player_patterns as player_urls, token_patterns as token_urls
from pong.urls import urlpatterns as pong_urls

urlpatterns = [
	path('admin/', admin.site.urls),
	path('api/blockchain/', get_blockchain_scores, name='blockchain_scores'),
	path('api/player/', include((player_urls, 'player'), namespace='player')),
	path('api/token/', include((token_urls, 'token'), namespace='token')),
	path('api/pong/', include((pong_urls, 'pong'), namespace='pong')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

