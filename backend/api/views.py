from django.http import JsonResponse
from django.contrib.auth.models import User
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from .models import UserProfile , Syllabus
from .serializers import UserProfileSerializer , SyllabusSerializer
from .serializers import (
    UserSerializer,
    RegisterSerializer,
    LoginSerializer,
    UpdateProfileSerializer
)
from rest_framework.parsers import MultiPartParser , FormParser , JSONParser
# from .tasks import extract_text_from_pdf
import logging
from .tasks import process_syllabus
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.permissions import IsAuthenticated

logger = logging.getLogger(__name__)


def health_check(request):
    return JsonResponse({
        "status": "success",
        "message": "StudyMate AI Backend is running 🚀",
        "version": "1.0.0"
    })



class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [AllowAny]
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.save()
        refresh = RefreshToken.for_user(user)

        return Response({
            "user": UserSerializer(user).data,
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "message": "Registration successful"
        }, status=status.HTTP_201_CREATED)



class LoginView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.validated_data
        refresh = RefreshToken.for_user(user)
        return Response({
            "user": UserSerializer(user).data,
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "message": "Login successful"
        })



class ProfileView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        return Response(UserSerializer(request.user).data)
    def put(self, request):
        serializer = UpdateProfileSerializer(
            request.user,
            data=request.data,
            partial=True
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)



class LogoutView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        try:
            refresh_token = request.data["refresh"]
            token = RefreshToken(refresh_token)
            token.blacklist()

            return Response({"message": "Logout successful"})
        except Exception:
            return Response(
                {"error": "Invalid or expired token"},
                status=status.HTTP_400_BAD_REQUEST
            )
            
class UserProfileView(APIView):
    permission_classes =[IsAuthenticated]
    
    def get(self , request):
        profile ,created = UserProfile.objects.get_or_create(user = request.user)
        serializer = UserProfileSerializer(profile)
        return Response(serializer.data)
    
    def put(self, request):
        profile , created = UserProfile.objects.get_or_create(user = request.user)
        serializer = UserProfileSerializer(profile, data = request.data , partial =True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
    
    


class SyllabusUploadView(APIView):
    
    permission_classes = [IsAuthenticated]   # 🔒 security
    parser_classes = [MultiPartParser, FormParser, JSONParser]  # 📁 file support
    
    def post(self, request):
        serializer = SyllabusSerializer(
            data=request.data,
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        
        syllabus = serializer.save()

        # 🔥 initial state
        syllabus.status = "pending"
        syllabus.progress = 0
        syllabus.is_processed = False
        syllabus.save()

        # 🚀 Celery trigger
        try:
            process_syllabus.delay(syllabus.id)
        except Exception as e:
            print("Celery error:", e)

        return Response({
            "message": "Syllabus uploaded! Processing started 🚀",
            "syllabus": SyllabusSerializer(
                syllabus,
                context={'request': request}
            ).data
        }, status=status.HTTP_201_CREATED)

class SyllabusDetailView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get_object(self , pk , user):
        try:
            return Syllabus.objects.get(id =pk , user = user)
        except Syllabus.DoesNotExist:
            return None
        
    def get(self ,request ,pk):
        syllabus = self.get_object(pk , request.user)
        if not syllabus:
            return Response({"error":"Syllabus not found"}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = SyllabusSerializer(syllabus, context={'request': request})
        return Response(serializer.data)
    
    def delete(self , request , pk):
        syllabus = self.get_object(pk , request.user)
        if not syllabus:
            return Response({"error":"Syllabus not found"} ,status=status.HTTP_404_NOT_FOUND)
        
        syllabus.file.delete()
        syllabus.delete()
        return Response({"message":"Syllabus deleted Successfully !"})
    
    
    
