import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from backend.middleware import JWTAuthMiddleware
from chat import routing as chat_routing
from notification import routing as notification_routing
from tournament import routing as tournament_routing
from game import routing as game_routing

"""
ASGI config for backend project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/4.2/howto/deployment/asgi/
"""

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")

django_asgi_app = get_asgi_application()

application = ProtocolTypeRouter(
    {
        "http": django_asgi_app,
        "websocket": JWTAuthMiddleware(
            URLRouter(
                chat_routing.websocket_urlpatterns
                + notification_routing.websocket_urlpatterns
                + tournament_routing.websocket_urlpatterns
                + game_routing.websocket_urlpatterns
            )
        ),
    }
)
