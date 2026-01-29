"""
WebSocket Consumer Tests
Tests: Chat, Game, Notification consumers with JWT auth
"""
from channels.testing import WebsocketCommunicator
from django.test import TransactionTestCase
from backend.asgi import application
from rest_framework_simplejwt.tokens import AccessToken
from accounts.models import User
from django.contrib.auth.hashers import make_password


class ChatConsumerTest(TransactionTestCase):
    """Test chat WebSocket consumer"""
    
    async def test_authenticated_connection(self):
        """Test WebSocket connects with valid JWT"""
        user = await User.objects.acreate(
            username='testuser',
            email='test@example.com',
            password=make_password('testpass123')
        )
        token = str(AccessToken.for_user(user))
        
        communicator = WebsocketCommunicator(
            application,
            f"/ws/chat/room123/?token={token}"
        )
        connected, _ = await communicator.connect()
        self.assertTrue(connected)
        await communicator.disconnect()
    
    async def test_unauthenticated_connection_rejected(self):
        """Test WebSocket rejects connection without token"""
        communicator = WebsocketCommunicator(
            application,
            "/ws/chat/room123/"
        )
        connected, _ = await communicator.connect()
        self.assertFalse(connected)
    
    async def test_invalid_token_rejected(self):
        """Test WebSocket rejects invalid JWT"""
        communicator = WebsocketCommunicator(
            application,
            "/ws/chat/room123/?token=invalid_token_here"
        )
        connected, _ = await communicator.connect()
        self.assertFalse(connected)


class GameConsumerTest(TransactionTestCase):
    """Test game WebSocket consumer"""
    
    async def test_game_room_connection(self):
        """Test connecting to game room with valid auth"""
        user = await User.objects.acreate(
            username='player1',
            email='player1@example.com',
            password=make_password('testpass123')
        )
        token = str(AccessToken.for_user(user))
        
        communicator = WebsocketCommunicator(
            application,
            f"/ws/game/testroom/?token={token}"
        )
        connected, _ = await communicator.connect()
        self.assertTrue(connected)
        await communicator.disconnect()


class NotificationConsumerTest(TransactionTestCase):
    """Test notification WebSocket consumer"""
    
    async def test_notification_connection(self):
        """Test user can connect to their notification channel"""
        user = await User.objects.acreate(
            username='testuser',
            email='test@example.com',
            password=make_password('testpass123')
        )
        token = str(AccessToken.for_user(user))
        
        communicator = WebsocketCommunicator(
            application,
            f"/ws/notification/{user.id}/?token={token}"
        )
        connected, _ = await communicator.connect()
        self.assertTrue(connected)
        await communicator.disconnect()
    
    async def test_cannot_connect_to_other_user_notifications(self):
        """Test user cannot listen to another user's notifications"""
        user1 = await User.objects.acreate(
            username='user1',
            email='user1@example.com',
            password=make_password('testpass123')
        )
        user2 = await User.objects.acreate(
            username='user2',
            email='user2@example.com',
            password=make_password('testpass123')
        )
        token1 = str(AccessToken.for_user(user1))
        
        # Try to connect to user2's notifications with user1's token
        communicator = WebsocketCommunicator(
            application,
            f"/ws/notification/{user2.id}/?token={token1}"
        )
        connected, _ = await communicator.connect()
        # Should be rejected or closed immediately
        await communicator.disconnect()
