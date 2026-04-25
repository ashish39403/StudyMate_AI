from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from rest_framework.response import Response
from api.models import Syllabus, ChatMessage
from .chains import ask_syllabus


class ChatWithSyllabusView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        syllabus_id = request.data.get('syllabus_id')
        question = request.data.get('question')
        
        if not syllabus_id or not question:
            return Response(
                {'error': 'syllabus_id and question are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            syllabus = Syllabus.objects.get(id=syllabus_id, user=request.user)
        except Syllabus.DoesNotExist:
            return Response({'error': 'Syllabus not found'}, status=status.HTTP_404_NOT_FOUND)
        
        if not syllabus.is_processed:
            return Response({
                'error': 'Syllabus is still processing',
                'status': 'processing'
            }, status=status.HTTP_425_TOO_EARLY)
        
        # ✅ FIX: Use extracted_text instead of content
        syllabus_text = syllabus.extracted_text
        
        # ✅ Pass text so vector store can be created if missing
        result = ask_syllabus(
            syllabus_id=syllabus_id, 
            question=question, 
            user=request.user, 
            text=syllabus_text
        )
        
        return Response({
            'question': question,
            'syllabus': syllabus.title,
            'answer': result['answer'],
            'sources': result.get('sources', [])
        })
  
  
class ChatHistoryView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, syllabus_id):
        try:
            messages = ChatMessage.objects.filter(
                syllabus_id=syllabus_id,
                user=request.user
            ).order_by('created_at')
            
            return Response([{
                'role': msg.role,
                'content': msg.content,
                'created_at': msg.created_at,
                'sources': msg.sources
            } for msg in messages])
            
        except Exception as e:
            return Response({'error': str(e)}, status=500)
    
    def delete(self, request, syllabus_id):
        try:
            ChatMessage.objects.filter(
                syllabus_id=syllabus_id,
                user=request.user
            ).delete()
            return Response({'message': 'History cleared'})
        except Exception as e:
            return Response({'error': str(e)}, status=500)