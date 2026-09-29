# Create your models here.
from django.db import models

class LoginStatus(models.TextChoices):
    SUCCESS = "SUCCESS", "Success"
    FAILED = "FAILED", "Failed"


class FaceUser(models.Model):

    full_name = models.CharField(max_length=100, null=True, blank=True)

    mobile = models.CharField(
        max_length=15,
        unique=True
    )

    email = models.EmailField(
        blank=True,
        null=True
    )

    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # def __str__(self):
    #     return self.full_name



class FaceProfile(models.Model):

    user = models.OneToOneField(
        FaceUser,
        on_delete=models.CASCADE,
        related_name="face_profile"
    )

    registered_image = models.ImageField(
        upload_to="face_auth/enrollments/"
    )

    embedding = models.BinaryField(
        editable=False
    )

    embedding_dimension = models.PositiveIntegerField(default=512)

    detection_score = models.FloatField()
    model_name = models.CharField(
        max_length=50,
        default="buffalo_l"
    )

    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # def __str__(self):
    #     return self.user.full_name



class FaceLoginHistory(models.Model):

    user = models.ForeignKey(
        FaceUser,
        on_delete=models.CASCADE,
        related_name="login_history"
    )

    confidence = models.FloatField()

    login_image = models.ImageField(
        upload_to="face_auth/login_attempts/",
        null=True,
        blank=True
    )
    detection_score = models.FloatField(
        null=True,
        blank=True
    )

    status = models.CharField(
        max_length=20,
        choices=LoginStatus.choices
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:
        ordering = ["-created_at"]

    # def __str__(self):
    #     return f"{self.user.full_name} - {self.status}"