from django.shortcuts import render

# Create your views here.
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from face_auth.serializers import FaceEnrollmentSerializer, FaceVerificationSerializer
from face_auth.services.enrollment import FaceEnrollmentService
from face_auth.services.verification import FaceVerificationService


class FaceEnrollmentAPIView(APIView):
    """
    Register a user and enroll their face.
    """

    def post(self, request):

        serializer = FaceEnrollmentSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(
                {
                    "success": False,
                    "errors": serializer.errors
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        result = FaceEnrollmentService.enroll(
            serializer.validated_data
        )

        if not result["success"]:
            return Response(
                result,
                status=status.HTTP_400_BAD_REQUEST
            )

        return Response(
            result,
            status=status.HTTP_201_CREATED
        )



class FaceVerificationAPIView(APIView):

    def post(self, request):

        serializer = FaceVerificationSerializer(
            data=request.data
        )

        if not serializer.is_valid():

            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )

        result = FaceVerificationService.verify(
            serializer.validated_data
        )

        return Response(result)