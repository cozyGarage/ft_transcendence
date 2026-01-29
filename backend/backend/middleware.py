"""
WebSocket Authentication Middleware
Provides JWT-based authentication for WebSocket connections
"""
from channels.middleware import BaseMiddleware
from channels.db import database_sync_to_async
from urllib.parse import parse_qs


class JWTAuthMiddleware(BaseMiddleware):
    """
    Middleware to authenticate WebSocket connections using JWT tokens.
    Token should be passed in query string: ws://...?token=<jwt_token>
    """
    
    async def __call__(self, scope, receive, send):
        from django.contrib.auth.models import AnonymousUser
        
        # Parse query string for token
        query_string = scope.get('query_string', b'').decode()
        query_params = parse_qs(query_string)
        
        # Get token from query params
        token = query_params.get('token', [None])[0]
        
        if token:
            scope['user'] = await self.get_user_from_token(token)
        else:
            scope['user'] = AnonymousUser()
        
        return await super().__call__(scope, receive, send)
    
    @database_sync_to_async
    def get_user_from_token(self, token):
        """Validate JWT token and return associated user"""
        from django.contrib.auth.models import AnonymousUser
        from rest_framework_simplejwt.tokens import AccessToken
        from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
        from accounts.models import User
        
        try:
            validated_token = AccessToken(token)
            user_id = validated_token['user_id']
            
            user = User.objects.get(id=user_id)
            return user
        except (InvalidToken, TokenError, User.DoesNotExist, KeyError):
            return AnonymousUser()
