"""
Game Model and API Tests
"""
from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from accounts.models import User
from django.contrib.auth.hashers import make_password


class GameRoomTest(TestCase):
    """Test game room creation and management"""
    
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create(
            username='player1',
            email='player1@example.com',
            password=make_password('testpass123')
        )
    
    def test_game_endpoints_exist(self):
        """Test game endpoints are accessible"""
        response = self.client.get('/game/')
        self.assertNotEqual(response.status_code, status.HTTP_404_NOT_FOUND)
