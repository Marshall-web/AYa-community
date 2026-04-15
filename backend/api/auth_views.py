from django.contrib.auth import authenticate, login, logout
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from .serializers import UserSerializer
from .validators import (
    validate_email_format, validate_username, validate_password, 
    validate_name, sanitize_text
)


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """Login endpoint that creates a session"""
    from .models import User

    username = request.data.get('username', '').strip()
    password = request.data.get('password', '')
    
    if not username or not password:
        return Response(
            {'error': 'Please provide both username and password'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Check if login is with email
    if '@' in username:
        try:
            user_obj = User.objects.get(email=username.lower())
            username = user_obj.username
        except User.DoesNotExist:
            # If email doesn't exist, let authenticate fail naturally with the email as username
            pass
    
    user = authenticate(request, username=username, password=password)
    
    if user is not None:
        login(request, user)
        serializer = UserSerializer(user)
        return Response({
            'user': serializer.data,
            'message': 'Login successful'
        })
    else:
        return Response(
            {'error': 'Invalid credentials'},
            status=status.HTTP_401_UNAUTHORIZED
        )


@api_view(['POST'])
@permission_classes([AllowAny])
def logout_view(request):
    """Logout endpoint that destroys the session"""
    logout(request)
    return Response({'message': 'Logout successful'})


@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    """Register a new user with input validation"""
    from .models import User
    
    username = request.data.get('username', '')
    email = request.data.get('email', '')
    password = request.data.get('password', '')
    first_name = request.data.get('first_name', '')
    
    # Validate inputs
    errors = {}
    
    try:
        username = validate_username(username)
    except Exception as e:
        errors['username'] = str(e.detail[0]) if hasattr(e, 'detail') else str(e)
    
    try:
        email = validate_email_format(email)
    except Exception as e:
        errors['email'] = str(e.detail[0]) if hasattr(e, 'detail') else str(e)
    
    try:
        password = validate_password(password)
    except Exception as e:
        errors['password'] = str(e.detail[0]) if hasattr(e, 'detail') else str(e)
    
    if first_name:
        try:
            first_name = validate_name(first_name, "First name", required=False)
        except Exception as e:
            errors['first_name'] = str(e.detail[0]) if hasattr(e, 'detail') else str(e)
    else:
        first_name = sanitize_text(first_name, 50)
    
    if errors:
        return Response(
            {'error': errors},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Check if user already exists
    if User.objects.filter(username=username).exists():
        return Response(
            {'error': 'Username already exists'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if User.objects.filter(email=email).exists():
        return Response(
            {'error': 'Email already exists'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Create user
    user = User.objects.create_user(
        username=username,
        email=email,
        password=password,
        first_name=first_name
    )
    
    # Auto-login after registration
    login(request, user)
    
    serializer = UserSerializer(user)
    return Response({
        'user': serializer.data,
        'message': 'Registration successful'
    }, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([AllowAny])
def current_user_view(request):
    """Get the current authenticated user"""
    if request.user.is_authenticated:
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
    else:
        return Response(
            {'error': 'Not authenticated'},
            status=status.HTTP_401_UNAUTHORIZED
        )
