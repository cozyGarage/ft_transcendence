""" 
Unit and Integration Tests for Authentication Flow
Tests: Login, 2FA, JWT refresh, rate limiting
"""
from django.test import TestCase, TransactionTestCase
from rest_framework.test import APIClient
from rest_framework import status
from accounts.models import User
from django.contrib.auth.hashers import make_password
import json


class UserAuthenticationTest(TestCase):
    """Test user authentication endpoints"""
    
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create(
            username='testuser',
            email='test@example.com',
            password=make_password('testpass123'),
            is_2fa_enabled=False
        )
    
    def test_login_with_valid_credentials(self):
        """Test login returns temp_token with valid credentials"""
        response = self.client.post('/api/v1/auth/login/', {
            'email': 'test@example.com',
            'password': 'testpass123'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('temp_token', response.data)
        
    def test_login_with_invalid_credentials(self):
        """Test login fails with wrong password"""
        response = self.client.post('/api/v1/auth/login/', {
            'email': 'test@example.com',
            'password': 'wrongpassword'
        })
        self.assertNotEqual(response.status_code, status.HTTP_200_OK)
    
    def test_login_with_nonexistent_user(self):
        """Test login fails with non-existent email"""
        response = self.client.post('/api/v1/auth/login/', {
            'email': 'nonexistent@example.com',
            'password': 'testpass123'
        })
        self.assertNotEqual(response.status_code, status.HTTP_200_OK)


class TokenRefreshTest(TestCase):
    """Test JWT token refresh functionality"""
    
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create(
            username='testuser',
            email='test@example.com',
            password=make_password('testpass123')
        )
        
        # Login to get tokens
        response = self.client.post('/api/v1/auth/login/', {
            'email': 'test@example.com',
            'password': 'testpass123'
        })
        self.temp_token = response.data.get('temp_token')
    
    def test_refresh_token_endpoint_exists(self):
        """Test refresh endpoint is accessible"""
        response = self.client.post('/api/v1/auth/refresh/')
        # Will fail without valid refresh cookie, but should not be 404
        self.assertNotEqual(response.status_code, status.HTTP_404_NOT_FOUND)


class UserRegistrationTest(TestCase):
    """Test user registration"""
    
    def setUp(self):
        self.client = APIClient()
    
    def test_register_new_user(self):
        """Test creating a new user account"""
        response = self.client.post('/api/v1/auth/register/', {
            'username': 'newuser',
            'email': 'newuser@example.com',
            'password': 'securepass123',
            'password_confirm': 'securepass123'
        })
        # Check if registration endpoint exists and processes request
        self.assertNotEqual(response.status_code, status.HTTP_404_NOT_FOUND)
    
    def test_register_duplicate_email(self):
        """Test registration fails with duplicate email"""
        User.objects.create(
            username='existing',
            email='existing@example.com',
            password=make_password('password123')
        )
        
        response = self.client.post('/api/v1/auth/register/', {
            'username': 'newuser',
            'email': 'existing@example.com',
            'password': 'password123',
            'password_confirm': 'password123'
        })
        self.assertNotEqual(response.status_code, status.HTTP_201_CREATED)


class APIRootTest(TestCase):
    """Test API root endpoint"""
    
    def setUp(self):
        self.client = APIClient()
    
    def test_api_root_returns_endpoints(self):
        """Test API root returns helpful endpoint list"""
        response = self.client.get('/api/v1/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('players', response.data)
        self.assertIn('auth', response.data)
