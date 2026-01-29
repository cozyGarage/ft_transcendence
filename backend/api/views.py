from rest_framework.decorators import api_view
from rest_framework.response import Response


@api_view(["GET"])
def api_root(request):
    """Simple API root that lists the most relevant endpoints for dev/debugging."""
    base = request.build_absolute_uri("/").rstrip("/")
    return Response({
        "players": f"{base}/api/v1/players/",
        "auth": f"{base}/api/v1/auth/",
        "tournament": f"{base}/tournament/",
        "game": f"{base}/game/",
        "chat_ws_example": f"{base.replace('http', 'ws')}/ws/chat/room123/?token=<JWT>",
    })
