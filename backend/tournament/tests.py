"""
Tournament Tests
"""
from django.test import TestCase
from rest_framework.test import APIClient
from accounts.models import User
from django.contrib.auth.hashers import make_password


class TournamentTest(TestCase):
    """Test tournament creation and management"""
    
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create(
            username='player1',
            email='player1@example.com',
            password=make_password('testpass123')
        )
    
    def test_tournament_endpoints_exist(self):
        """Test tournament endpoints are accessible"""
        response = self.client.get('/tournament/')
        self.assertNotEqual(response.status_code, 404)
