import logging

from django.db import transaction

from scipy.spatial.distance import cosine

from face_auth.models import (
    FaceUser,
    FaceProfile,
    FaceLoginHistory,
    LoginStatus
)

from face_auth.services.base import BaseFaceService
from face_auth.services.utils import EmbeddingUtils

logger = logging.getLogger(__name__)


class FaceVerificationService(BaseFaceService):

    MATCH_THRESHOLD = 0.65

    @classmethod
    @transaction.atomic
    def verify(cls, data):

        try:

            user = FaceUser.objects.get(
                mobile=data["mobile"],
                is_active=True
            )

        except FaceUser.DoesNotExist:

            return {
                "success": False,
                "message": "User not found."
            }

        profile = FaceProfile.objects.get(
            user=user,
            is_active=True
        )

        result = cls.process_uploaded_image(
            data["image"]
        )

        if not result["success"]:
            return result

        stored_embedding = EmbeddingUtils.bytes_to_embedding(
            profile.embedding
        )

        uploaded_embedding = result["embedding"]

        similarity = 1 - cosine(
            stored_embedding,
            uploaded_embedding
        )

        confidence = float(similarity)

        logger.info(f"Similarity: {confidence}")

        if confidence >= cls.MATCH_THRESHOLD:

            facehistory = FaceLoginHistory.objects.create(
                user=user,
                confidence=confidence,
                detection_score=result["det_score"],
                login_image=data["image"],
                status=LoginStatus.SUCCESS
            )

            return {
                "success": True,
                "message": "Face verified successfully.",
                "confidence": round(confidence, 4),
                "user_id": user.id,
                "face_history_id": facehistory.id
            }

        facehistory = FaceLoginHistory.objects.create(
            user=user,
            confidence=confidence,
            detection_score=result["det_score"],
            login_image=data["image"],
            status=LoginStatus.FAILED
        )

        return {
            "success": False,
            "message": "Face does not match.",
            "confidence": round(confidence, 4)
        }
    
