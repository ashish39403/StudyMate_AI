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
import requests
from .models import ChatMessage
from ai_engine.chains import ask_syllabus


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





from django.contrib.auth import authenticate

class LoginView(APIView):
    permission_classes = []
    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")

        if not username or not password:
            return Response(
                {"error": "Username and password required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        user = authenticate(username=username, password=password)

        if user is None:
            return Response(
                {"error": "Invalid username or password"},
                status=status.HTTP_400_BAD_REQUEST
            )

        refresh = RefreshToken.for_user(user)

        return Response({
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "user": {
                "username": user.username,
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
            }
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
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get(self, request):
        syllabus = Syllabus.objects.filter(user=request.user)
        serializer = SyllabusSerializer(syllabus, many=True, context={'request': request})
        return Response(serializer.data)

    def post(self, request):
        serializer = SyllabusSerializer(
            data=request.data,
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        
        syllabus = serializer.save()
        syllabus.is_processed = False
        syllabus.save()

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
    
    
    
class ChatHistoryView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, syllabus_id):
        messages = ChatMessage.objects.filter(
            syllabus_id=syllabus_id,
            user=request.user
        ).order_by('created_at')
        return Response([{
            'role': msg.role,
            'content': msg.content,
            'created_at': msg.created_at
        } for msg in messages])

class ChatWithHistoryView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        syllabus_id = request.data.get('syllabus_id')
        question = request.data.get('question')
        
        # Get history
        history = ChatMessage.objects.filter(
            syllabus_id=syllabus_id,
            user=request.user
        ).order_by('-created_at')[:6]  # Last 6 messages
        
        # Build context from history
        context = "\n".join([
            f"{'Student' if msg.role == 'user' else 'AI'}: {msg.content}"
            for msg in reversed(history)
        ])
        
        # Get answer from RAG
        result = ask_syllabus(syllabus_id, question, context)
        
        # Save both messages
        ChatMessage.objects.create(syllabus_id=syllabus_id, user=request.user, role='user', content=question)
        ChatMessage.objects.create(syllabus_id=syllabus_id, user=request.user, role='assistant', content=result['answer'])
        
        return Response(result)