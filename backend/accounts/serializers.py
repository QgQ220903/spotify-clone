from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'user_type', 'bio', 'is_staff']
        extra_kwargs = {
            'password': {'write_only': True, 'required': False},
            'is_staff': {'read_only': True}  # Đảm bảo không thể chỉnh sửa qua API
        }

    def create(self, validated_data):
        # Đảm bảo is_staff luôn là True khi tạo mới
        validated_data['is_staff'] = True
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            is_staff=True  # Thêm dòng này
        )
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        if password:
            instance.set_password(password)

        instance.save()
        return instance
    
class AdminUserSerializer(UserSerializer):
    """Serializer for admin users with additional permissions"""
    class Meta(UserSerializer.Meta):
        fields = UserSerializer.Meta.fields
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