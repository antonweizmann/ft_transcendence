"""
ASGI config for core project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.1/howto/deployment/asgi/
"""

import os

from django.core.asgi import get_asgi_application # type: ignore
from django.urls import path # type: ignore
from channels.routing import ProtocolTypeRouter, URLRouter # type: ignore
from channels.auth import AuthMiddlewareStack # type: ignore
from pong.consumers import PongConsumer

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')

django_asgi_app = get_asgi_application()

application = ProtocolTypeRouter({
	'http': django_asgi_app,
	'websocket': AuthMiddlewareStack(
		URLRouter([
			path('ws/pong/', PongConsumer.as_asgi()),
		])
	)
})