from email.mime import image

import cv2
from django.template import engine
import numpy as np
# from face_auth.services.face_engine import FaceEngine
from face_auth.services.opencv_face_engine import opencv_face_engine


class FaceEmbeddingService:
    """
    Service responsible for:
    - Reading image
    - Detecting face
    - Generating embedding
    """

    @staticmethod
    def load_uploaded_image(uploaded_file):
        """
        Load an uploaded image from a DRF request.
        """

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

    # @staticmethod
    # def get_embedding(image):
    #     """
    #     Parameters:
    #         image : numpy.ndarray (BGR image from OpenCV)

    #     Returns:
    #         {
    #             "success": True/False,
    #             "message": "...",
    #             "embedding": np.ndarray,
    #             "bbox": [...],
    #             "det_score": float
    #         }
    #     """

    #     app = FaceEngine.get_app()

    #     faces = app.get(image)

    #     if len(faces) == 0:
    #         return {
    #             "success": False,
    #             "message": "No face detected."
    #         }

    #     if len(faces) > 1:
    #         return {
    #             "success": False,
    #             "message": "Multiple faces detected."
    #         }

    #     face = faces[0]

    #     return {
    #         "success": True,
    #         "message": "Face detected successfully.",
    #         "embedding": face.embedding,
    #         "bbox": face.bbox.tolist(),
    #         "det_score": float(face.det_score)
    #     }

    @staticmethod
    def get_embedding(image):

        return opencv_face_engine.get_embedding(image)



    @staticmethod
    def load_image(image_path):
        """
        Reads image from disk.
        """

        image = cv2.imread(image_path)

        if image is None:
            raise Exception("Unable to read image.")

        return image