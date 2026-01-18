from django.urls import path
from . import views

urlpatterns = [
    path(
        "game_play/",
        views.getGamePlayOfTheCurrentUser,
        name="getGamePlayOfTheCurrentUser",
    ),
    path("game_history/me/", views.getMyGameHistory, name="getMyGameHistory"),
    path(
        "game_history/<str:username>/",
        views.getGameHistoryByUserName,
        name="getGameHistoryByUserName",
    ),
    # Othello endpoints
    path("othello/history/", views.othello_game_history, name="othello_game_history"),
    path("othello/stats/", views.othello_stats, name="othello_stats"),
    path(
        "othello/stats/<str:username>/",
        views.othello_stats_by_username,
        name="othello_stats_by_username",
    ),
    path("othello/leaderboard/", views.othello_leaderboard, name="othello_leaderboard"),
]
