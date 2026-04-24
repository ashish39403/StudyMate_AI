from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from rest_framework.response import Response
from api.models import Syllabus
from .chains import ask_syllabus
# Create your views here.

class ChatWithSyllabusView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self , request):
        syllabus_id = request.data.get("syllabus_id")
        question = request.data.get("question")
        
        if not syllabus_id or not question:
            return Response(
                {'error':'Both syllabus_id and question are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        try:
            syllabus = Syllabus.objects.get(
                id = syllabus_id,
                user = request.user
            )
        except Syllabus.DoesNotExist:
            return Response(
                {'error':'Syllabus not found or does not belong to you'},
                status=status.HTTP_404_NOT_FOUND
            )
        if not syllabus.is_processed:
            return Response(
                {
                    'error': 'Syllabus is still being processed. Please wait.',
                    'syllabus_id': syllabus.id,
                    'status': 'processing'
                },
                status=status.HTTP_425_TOO_EARLY
            )
            
        result = ask_syllabus(syllabus_id , question)
        return Response({
            'question':question,
            'syllabus_id':syllabus_id,
            'syllabus_title':syllabus.title,
            'answer':result.get('answer' ,'No answer generated'),
            'sources': result.get('source', [])
        }, status=status.HTTP_200_OK)
        