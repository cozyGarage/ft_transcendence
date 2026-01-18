from django.urls import path

from .consumers import GameConsumer, MatchMaikingConsumer
from .othello_consumer import OthelloGameConsumer

websocket_urlpatterns = [
    path("ws/matchmaking/<str:id>/", MatchMaikingConsumer.as_asgi()),
    path("ws/game/<str:room_name>/", GameConsumer.as_asgi()),
    path("ws/othello/<str:room_name>/", OthelloGameConsumer.as_asgi()),
]
