from rest_framework import serializers
from .models import GamePlay, GameHestory, OthelloGameHistory, OthelloStats
from Player.Serializers.PlayerSerializer import DefaultPlayerSerializer


class GamePlaySerializer(serializers.ModelSerializer):
    class Meta:
        model = GamePlay
        fields = [
            "id",
            "board",
            "board_color",
            "first_racket_color",
            "second_racket_color",
            "ball_color",
            "player",
        ]


class GameHestorySerializer(serializers.ModelSerializer):
    player = DefaultPlayerSerializer(required=False)
    opponent_player = DefaultPlayerSerializer(required=False)

    class Meta:
        model = GameHestory
        fields = [
            "id",
            "time",
            "player_score",
            "opponent_score",
            "result",
            "player",
            "opponent_player",
        ]


# Othello Serializers
class OthelloGameHistorySerializer(serializers.ModelSerializer):
    player_username = serializers.CharField(
        source="player.user.username", read_only=True
    )
    opponent_username = serializers.CharField(
        source="opponent.user.username", read_only=True, allow_null=True
    )

    class Meta:
        model = OthelloGameHistory
        fields = [
            "id",
            "player",
            "player_username",
            "opponent",
            "opponent_username",
            "player_score",
            "opponent_score",
            "result",
            "game_mode",
            "move_count",
            "game_duration",
            "created_at",
        ]
        read_only_fields = ["id", "created_at", "player_username", "opponent_username"]


class OthelloStatsSerializer(serializers.ModelSerializer):
    player_username = serializers.CharField(
        source="player.user.username", read_only=True
    )
    player_id = serializers.IntegerField(source="player.id", read_only=True)

    class Meta:
        model = OthelloStats
        fields = [
            "id",
            "player",
            "player_id",
            "player_username",
            "wins",
            "losses",
            "draws",
            "total_games",
            "win_rate",
            "highest_score",
            "total_discs_captured",
            "average_game_duration",
            "elo_rating",
            "updated_at",
        ]
        read_only_fields = ["id", "updated_at", "player_username", "player_id"]


class OthelloLeaderboardSerializer(serializers.ModelSerializer):
    """Simplified serializer for leaderboard display"""

    username = serializers.CharField(source="player.user.username", read_only=True)
    avatar = serializers.CharField(source="player.avatar", read_only=True)

    class Meta:
        model = OthelloStats
        fields = [
            "username",
            "avatar",
            "wins",
            "losses",
            "total_games",
            "win_rate",
            "elo_rating",
            "highest_score",
        ]
