from rest_framework.decorators import api_view, permission_classes
from django.views.decorators.csrf import csrf_exempt

from rest_framework import status
from django.http import JsonResponse
from rest_framework.permissions import IsAuthenticated
from .models import GamePlay, GameHestory, OthelloGameHistory, OthelloStats
from .serializers import (
    GamePlaySerializer,
    GameHestorySerializer,
    OthelloGameHistorySerializer,
    OthelloStatsSerializer,
    OthelloLeaderboardSerializer,
)
from Player.Models.PlayerModel import Player


@csrf_exempt
@api_view(["GET", "PUT"])
@permission_classes([IsAuthenticated])
def getGamePlayOfTheCurrentUser(request):
    try:
        gameplay = GamePlay.objects.get(player__user=request.user)
    except GamePlay.DoesNotExist:
        return JsonResponse(
            {"error": "User profile does not exist"}, status=status.HTTP_404_NOT_FOUND
        )

    if request.method == "GET":
        serializer = GamePlaySerializer(gameplay)
        return JsonResponse(serializer.data, safe=False, status=status.HTTP_200_OK)

    if request.method == "PUT":
        data = request.data
        serializer = GamePlaySerializer(gameplay, data=data)
        if serializer.is_valid():
            serializer.save()
            return JsonResponse(serializer.data, safe=False, status=status.HTTP_200_OK)
        return JsonResponse(serializer.errors, safe=False, status=status.HTTP_200_OK)


@csrf_exempt
@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def getMyGameHistory(request):
    if request.method == "GET":
        gamehistory = GameHestory.objects.filter(player__user=request.user).order_by(
            "-id"
        )
        serializer = GameHestorySerializer(gamehistory, many=True)
        return JsonResponse(serializer.data, safe=False, status=status.HTTP_200_OK)

    if request.method == "POST":
        data = request.data
        try:
            player = Player.objects.get(user=request.user)
            opponent_player = Player.objects.get(id=data["opponent_player"])
            GameHestory.objects.create(
                player=player,
                player_score=data["player_score"],
                opponent_score=data["opponent_score"],
                result=data["result"],
                opponent_player=opponent_player,
            )
            return JsonResponse(
                {"response": "the history has been succefully created!!!"},
                safe=False,
                status=status.HTTP_201_CREATED,
            )
        except Player.DoesNotExist:
            return JsonResponse(
                {"error": "User profile does not exist"},
                status=status.HTTP_404_NOT_FOUND,
            )


@csrf_exempt
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def getGameHistoryByUserName(request, username):
    try:
        player = Player.objects.get(user__username=username)
        gamehistory = GameHestory.objects.filter(player=player).order_by("-id")
        serializer = GameHestorySerializer(gamehistory, many=True)
        return JsonResponse(serializer.data, safe=False, status=status.HTTP_200_OK)
    except Player.DoesNotExist:
        return JsonResponse(
            {"error": "Player Doesn't Exist !!!"},
            safe=False,
            status=status.HTTP_404_NOT_FOUND,
        )


# Othello API Views
@csrf_exempt
@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def othello_game_history(request):
    """Get or create Othello game history"""
    if request.method == "GET":
        games = OthelloGameHistory.objects.filter(player__user=request.user).order_by(
            "-created_at"
        )
        serializer = OthelloGameHistorySerializer(games, many=True)
        return JsonResponse(serializer.data, safe=False, status=status.HTTP_200_OK)

    if request.method == "POST":
        data = request.data
        try:
            player = Player.objects.get(user=request.user)

            # Create game history
            game = OthelloGameHistory.objects.create(
                player=player,
                opponent=Player.objects.get(id=data["opponent"])
                if data.get("opponent")
                else None,
                player_score=data["player_score"],
                opponent_score=data["opponent_score"],
                result=data["result"],
                game_mode=data.get("game_mode", "ai_medium"),
                move_count=data.get("move_count", 0),
                game_duration=data.get("game_duration"),
            )

            # Update or create player stats
            stats, created = OthelloStats.objects.get_or_create(player=player)
            stats.update_stats()

            serializer = OthelloGameHistorySerializer(game)
            return JsonResponse(
                serializer.data, safe=False, status=status.HTTP_201_CREATED
            )
        except Player.DoesNotExist:
            return JsonResponse(
                {"error": "Player does not exist"}, status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


@csrf_exempt
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def othello_stats(request):
    """Get Othello stats for current user"""
    try:
        player = Player.objects.get(user=request.user)
        stats, created = OthelloStats.objects.get_or_create(player=player)

        if created or stats.total_games == 0:
            stats.update_stats()

        serializer = OthelloStatsSerializer(stats)
        return JsonResponse(serializer.data, safe=False, status=status.HTTP_200_OK)
    except Player.DoesNotExist:
        return JsonResponse(
            {"error": "Player does not exist"}, status=status.HTTP_404_NOT_FOUND
        )


@csrf_exempt
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def othello_leaderboard(request):
    """Get Othello leaderboard (top players by ELO rating)"""
    limit = int(request.GET.get("limit", 10))
    stats = OthelloStats.objects.filter(total_games__gt=0).order_by(
        "-elo_rating", "-win_rate"
    )[:limit]
    serializer = OthelloLeaderboardSerializer(stats, many=True)
    return JsonResponse(serializer.data, safe=False, status=status.HTTP_200_OK)


@csrf_exempt
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def othello_stats_by_username(request, username):
    """Get Othello stats for a specific user"""
    try:
        player = Player.objects.get(user__username=username)
        stats, created = OthelloStats.objects.get_or_create(player=player)

        if created or stats.total_games == 0:
            stats.update_stats()

        serializer = OthelloStatsSerializer(stats)
        return JsonResponse(serializer.data, safe=False, status=status.HTTP_200_OK)
    except Player.DoesNotExist:
        return JsonResponse(
            {"error": "Player does not exist"}, status=status.HTTP_404_NOT_FOUND
        )
