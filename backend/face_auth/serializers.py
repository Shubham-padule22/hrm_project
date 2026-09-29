from rest_framework import serializers


class FaceEnrollmentSerializer(serializers.Serializer):
    # full_name = serializers.CharField(max_length=100)
    mobile = serializers.CharField(max_length=15)
    # email = serializers.EmailField(required=False, allow_blank=True)
    image = serializers.ImageField()

    def validate_mobile(self, value):
        if len(value) < 10:
            raise serializers.ValidationError("Invalid mobile number.")
        return value


class FaceVerificationSerializer(serializers.Serializer):

    mobile = serializers.CharField(max_length=15)

    image = serializers.ImageField()