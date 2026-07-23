from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from drf_spectacular.utils import extend_schema, OpenApiResponse
from apps.accounts.serializers import (
    RegisterSerializer,
    LoginSerializer,
    UserSerializer,
    ProfileSerializer,
    ChangePasswordSerializer,
)
from apps.accounts.services import (
    register_user,
    update_user_profile,
    change_user_password,
)


class RegisterAPIView(APIView):
    """
    Endpoint for registering new user accounts.
    """
    permission_classes = [permissions.AllowAny]

    @extend_schema(
        request=RegisterSerializer,
        responses={201: OpenApiResponse(description="User successfully registered.")}
    )
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Call service to register user
        user, token = register_user(
            username=serializer.validated_data['username'],
            email=serializer.validated_data['email'],
            password=serializer.validated_data['password'],
            bio=serializer.validated_data.get('bio', ""),
            mobile_number=serializer.validated_data.get('mobile_number', ""),
            full_name=serializer.validated_data.get('full_name', "")
        )
        
        user_data = UserSerializer(user).data
        return Response({
            "token": token.key,
            "user": user_data
        }, status=status.HTTP_201_CREATED)


class LoginAPIView(APIView):
    """
    Endpoint for authenticating existing users. Returns token.
    """
    permission_classes = [permissions.AllowAny]

    @extend_schema(
        request=LoginSerializer,
        responses={200: OpenApiResponse(description="User successfully logged in.")}
    )
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = serializer.validated_data['user']
        token, _ = Token.objects.get_or_create(user=user)
        
        user_data = UserSerializer(user).data
        return Response({
            "token": token.key,
            "user": user_data
        }, status=status.HTTP_200_OK)


class LogoutAPIView(APIView):
    """
    Endpoint for logging out. Revokes token.
    """
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        responses={200: OpenApiResponse(description="User successfully logged out.")}
    )
    def post(self, request):
        # Delete user token
        Token.objects.filter(user=request.user).delete()
        return Response({"detail": "Successfully logged out."}, status=status.HTTP_200_OK)


class ProfileAPIView(APIView):
    """
    Endpoint to retrieve or modify the authenticated user's profile.
    """
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        responses={200: UserSerializer}
    )
    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @extend_schema(
        request=ProfileSerializer,
        responses={200: ProfileSerializer}
    )
    def put(self, request):
        serializer = ProfileSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        
        # Call service to modify profile details
        profile = update_user_profile(
            user=request.user,
            avatar=serializer.validated_data.get('avatar'),
            bio=serializer.validated_data.get('bio'),
            mobile_number=serializer.validated_data.get('mobile_number')
        )
        
        return Response(ProfileSerializer(profile).data, status=status.HTTP_200_OK)


class ChangePasswordAPIView(APIView):
    """
    Endpoint for changing password.
    """
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        request=ChangePasswordSerializer,
        responses={200: OpenApiResponse(description="Password changed successfully.")}
    )
    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        
        # Call service to change password
        change_user_password(
            user=request.user,
            password=serializer.validated_data['new_password']
        )
        
        return Response({"detail": "Password successfully updated."}, status=status.HTTP_200_OK)
