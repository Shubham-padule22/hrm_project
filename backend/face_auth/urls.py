from django.urls import path

from face_auth.views import FaceEnrollmentAPIView, FaceVerificationAPIView

urlpatterns = [
    path(
        "enroll/",
        FaceEnrollmentAPIView.as_view(),
        name="face-enroll"
    ),
    path(
    "verify/",
    FaceVerificationAPIView.as_view(),
    name="face-verify"
),
]