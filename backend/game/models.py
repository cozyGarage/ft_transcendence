from django.db import models
from Player.Models.PlayerModel import Player


class GamePlay(models.Model):
    player = models.ForeignKey(
        Player, on_delete=models.CASCADE, related_name="player", null=True
    )
    board = models.IntegerField(default=0)
    board_color = models.CharField(max_length=10, default="#00fffc")
    first_racket_color = models.CharField(max_length=10, default="#FFFFFF")
    second_racket_color = models.CharField(max_length=10, default="#000000")
    ball_color = models.CharField(max_length=10, default="#CCCCCC")

    def __str__(self):
        return str(self.player.user.username)


class GameHestory(models.Model):
    player = models.ForeignKey(
        Player, on_delete=models.CASCADE, related_name="player_hestory", null=True
    )
    opponent_player = models.ForeignKey(
        Player, on_delete=models.CASCADE, related_name="opponent_player", null=True
    )
    time = models.DateTimeField(auto_now_add=True)
    player_score = models.IntegerField(default=0)
    opponent_score = models.IntegerField(default=0)
    result = models.CharField(max_length=10, default="win")

    def __str__(self):
        return str(self.player.user.username)


# Othello Game Models
class OthelloGameHistory(models.Model):
    """Store individual Othello game results"""

    GAME_MODES = [
        ("ai_easy", "AI Easy"),
        ("ai_medium", "AI Medium"),
        ("ai_hard", "AI Hard"),
        ("online", "Online"),
        ("local", "Local"),
    ]

    RESULTS = [
        ("win", "Win"),
        ("lose", "Lose"),
        ("draw", "Draw"),
    ]

    player = models.ForeignKey(
        Player, on_delete=models.CASCADE, related_name="othello_games"
    )
    opponent = models.ForeignKey(
        Player,
        on_delete=models.CASCADE,
        related_name="othello_opponent_games",
        null=True,
        blank=True,
    )
    player_score = models.IntegerField(default=0)
    opponent_score = models.IntegerField(default=0)
    result = models.CharField(max_length=10, choices=RESULTS, default="win")
    game_mode = models.CharField(max_length=20, choices=GAME_MODES, default="ai_medium")
    move_count = models.IntegerField(default=0)
    game_duration = models.IntegerField(null=True, blank=True)  # seconds
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Othello Game History"
        verbose_name_plural = "Othello Game Histories"

    def __str__(self):
        return f"{self.player.user.username} vs {self.opponent.user.username if self.opponent else 'AI'} - {self.result}"


class OthelloStats(models.Model):
    """Store aggregate Othello statistics for each player"""

    player = models.OneToOneField(
        Player, on_delete=models.CASCADE, related_name="othello_stats"
    )
    wins = models.IntegerField(default=0)
    losses = models.IntegerField(default=0)
    draws = models.IntegerField(default=0)
    total_games = models.IntegerField(default=0)
    win_rate = models.FloatField(default=0.0)
    highest_score = models.IntegerField(default=0)
    total_discs_captured = models.IntegerField(default=0)
    average_game_duration = models.FloatField(default=0.0)
    elo_rating = models.IntegerField(default=1200)  # ELO rating system
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Othello Stats"
        verbose_name_plural = "Othello Stats"

    def __str__(self):
        return f"{self.player.user.username} - Othello Stats"

    def update_stats(self):
        """Recalculate stats from game history"""
        games = OthelloGameHistory.objects.filter(player=self.player)
        self.total_games = games.count()
        self.wins = games.filter(result="win").count()
        self.losses = games.filter(result="lose").count()
        self.draws = games.filter(result="draw").count()
        self.win_rate = (
            (self.wins / self.total_games * 100) if self.total_games > 0 else 0.0
        )
        self.highest_score = (
            games.aggregate(models.Max("player_score"))["player_score__max"] or 0
        )
        self.total_discs_captured = (
            games.aggregate(models.Sum("player_score"))["player_score__sum"] or 0
        )
        avg_duration = games.filter(game_duration__isnull=False).aggregate(
            models.Avg("game_duration")
        )["game_duration__avg"]
        self.average_game_duration = avg_duration or 0.0
        self.save()
