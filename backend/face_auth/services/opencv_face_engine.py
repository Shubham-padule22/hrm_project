import os
import cv2


class OpenCVFaceEngine:

    def __init__(self):

        base_dir = os.path.dirname(os.path.dirname(__file__))

        self.detector_model = os.path.join(
            base_dir,
            "models",
            "face_detection_yunet_2023mar.onnx"
        )

        self.recognizer_model = os.path.join(
            base_dir,
            "models",
            "face_recognition_sface_2021dec.onnx"
        )

        print("Detector Model :", self.detector_model)
        print("Recognizer Model :", self.recognizer_model)

        # Load YuNet detector
        self.detector = cv2.FaceDetectorYN.create(
            model=self.detector_model,
            config="",
            input_size=(320, 320),
            score_threshold=0.9,
            nms_threshold=0.3,
            top_k=5000
        )

        # Load SFace recognizer
        self.recognizer = cv2.FaceRecognizerSF.create(
            model=self.recognizer_model,
            config=""
        )

        print("✅ YuNet loaded successfully.")
        print("✅ SFace loaded successfully.")



    def detect_faces(self, image):
        """
        Detect faces using YuNet.
        """

        h, w = image.shape[:2]

        self.detector.setInputSize((w, h))

        retval, faces = self.detector.detect(image)

        if faces is None:
            return []

        return faces


    def align_face(self, image, face):
        """
        Align the detected face using SFace.
        """

        aligned_face = self.recognizer.alignCrop(
            image,
            face
        )

        return aligned_face


    def extract_embedding(self, aligned_face):
        """
        Generate face embedding.
        """

        embedding = self.recognizer.feature(
            aligned_face
        )

        return embedding


    def get_embedding(self, image):
        """
        Detect a single face and generate embedding.
        """

        faces = self.detect_faces(image)

        if len(faces) == 0:
            return {
                "success": False,
                "message": "No face detected."
            }

        if len(faces) > 1:
            return {
                "success": False,
                "message": "Multiple faces detected."
            }

        face = faces[0]

        aligned_face = self.align_face(
            image,
            face
        )

        embedding = self.extract_embedding(
            aligned_face
        )

        return {
            "success": True,
            "message": "Face detected successfully.",
            "embedding": embedding.flatten(),
            "bbox": face[:4].tolist(),
            "det_score": float(face[-1])
        }


opencv_face_engine = OpenCVFaceEngine()