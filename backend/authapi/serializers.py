from rest_framework import serializers
from .models import User
from django.contrib.auth.password_validation import validate_password


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True, required=True, validators=[validate_password]
    )

    class Meta:
        model = User
        fields = ("username", "email", "password", "role", "is_active")

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data["email"],
            password=validated_data["password"],
            role=validated_data["role"],
            is_active=validated_data.get("is_active", True),
        )
        return user


class AdminUserCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("username", "email", "role", "is_active")

    def create(self, validated_data):
        # Generate a random password
        password = User.generate_random_password()

        # Create the user
        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data["email"],
            password=password,
            role=validated_data["role"],
            is_active=validated_data.get("is_active", True),
        )

        user.temporary_password = password
        return user


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = (
            "id",
            "username",
            "email",
            "role",
            "profile_picture",
            "is_active",
            "email_notifications",
            "in_app_notifications",
            "auto_approve_high_confidence",
            "two_factor_enabled",
        )


class ProfileUpdateSerializer(serializers.ModelSerializer):
    new_password = serializers.CharField(
        write_only=True, required=False, validators=[validate_password]
    )
    current_password = serializers.CharField(write_only=True, required=False)
    profile_picture = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = User
        fields = [
            "username",
            "current_password",
            "new_password",
            "profile_picture",
            "is_active",
            "email_notifications",
            "in_app_notifications",
            "auto_approve_high_confidence",
            "two_factor_enabled",
        ]

    def validate(self, data):
        user = self.context["request"].user

        if "new_password" in data:
            if not user.check_password(data.get("current_password")):
                raise serializers.ValidationError(
                    {"current_password": "Current password is incorrect."}
                )
        return data

    def update(self, instance, validated_data):
        if "username" in validated_data:
            instance.username = validated_data["username"]

        if "new_password" in validated_data:
            instance.set_password(validated_data["new_password"])

        if "profile_picture" in validated_data:
            if instance.profile_picture:
                instance.profile_picture.delete(save=False)
            instance.profile_picture = validated_data["profile_picture"]

        if "is_active" in validated_data:
            instance.is_active = validated_data["is_active"]

        if "email_notifications" in validated_data:
            instance.email_notifications = validated_data["email_notifications"]

        if "in_app_notifications" in validated_data:
            instance.in_app_notifications = validated_data["in_app_notifications"]

        if "auto_approve_high_confidence" in validated_data:
            instance.auto_approve_high_confidence = validated_data["auto_approve_high_confidence"]

        if "two_factor_enabled" in validated_data:
            instance.two_factor_enabled = validated_data["two_factor_enabled"]

        instance.save()
        return instance
