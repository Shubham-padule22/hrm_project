from django.db import transaction
import logging
from face_auth.models import FaceUser, FaceProfile
from face_auth.services.embedding import FaceEmbeddingService
from face_auth.services.utils import EmbeddingUtils
from face_auth.services.base import BaseFaceService


@staticmethod
def load_uploaded_image(uploaded_file):
    """
    Reads uploaded image from DRF request.
    """

    import cv2
    import numpy as np

    uploaded_file.seek(0)

    file_bytes = np.frombuffer(
        uploaded_file.read(),
        dtype=np.uint8
    )

    image = cv2.imdecode(
        file_bytes,
        cv2.IMREAD_COLOR
    )

    if image is None:
        raise Exception("Invalid image.")

    return image


logger = logging.getLogger(__name__)


class FaceEnrollmentService(BaseFaceService):

    @classmethod
    @transaction.atomic
    def enroll(cls, data):
        try:

            result = cls.process_uploaded_image(
                data["image"]
            )

            if not result["success"]:
                return result

            if FaceUser.objects.filter(
                mobile=data["mobile"]
            ).exists():

                return {
                    "success": False,
                    "message": "Mobile number already registered."
                }

            user = FaceUser.objects.create(
                # full_name=data["full_name"],
                mobile=data["mobile"],
                email=data.get("email")
            )

            FaceProfile.objects.create(
                user=user,
                registered_image=data["image"],
                embedding=EmbeddingUtils.embedding_to_bytes(
                    result["embedding"]
                ),
                embedding_dimension=len(result["embedding"]),
                detection_score=result["det_score"]
            )

            logger.info(
                f"Face enrolled successfully. User ID: {user.id}"
            )

            return {
                "success": True,
                "message": "Face enrolled successfully.",
                "user_id": user.id
            }

        except Exception as e:

            logger.exception(
                "Face enrollment failed."
            )

            return {
                "success": False,
                "message": "Unable to enroll face.",
                "error": str(e)
            }