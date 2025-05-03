from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    is_admin_user = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'profile_pic', 'bio', 'following', 'user_type', 'is_admin_user']
        extra_kwargs = {
            'password': {'write_only': True},
            'user_type': {'read_only': True}
        }

    
    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password']
        )
        return user


class AdminUserSerializer(UserSerializer):
    """Serializer for admin users with additional permissions"""
    class Meta(UserSerializer.Meta):
        fields = UserSerializer.Meta.fields + ['is_staff']
        extra_kwargs = {
            **UserSerializer.Meta.extra_kwargs,
            'user_type': {'read_only': False}  # Admins can change user types
        }


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Add custom claims
        token['username'] = user.username
        token['user_type'] = user.user_type
        token['is_admin'] = user.is_admin_user
        return token