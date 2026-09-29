from face_auth.services.embedding import FaceEmbeddingService


class BaseFaceService:
    """
    Common functionality shared by all face services.
    """

    MIN_DETECTION_SCORE = 0.85

    @classmethod
    def process_uploaded_image(cls, uploaded_image):
        """
        Validate uploaded image and generate embedding.
        """

        image = FaceEmbeddingService.load_uploaded_image(uploaded_image)

        result = FaceEmbeddingService.get_embedding(image)

        if not result["success"]:
            return result

        if result["det_score"] < cls.MIN_DETECTION_SCORE:
            return {
                "success": False,
                "message": (
                    "Face image quality is too low. "
                    "Please upload a clearer image."
                )
            }

        return result