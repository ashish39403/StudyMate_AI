from django.contrib import admin
from .models import UserProfile, Syllabus , ChatMessage

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'college', 'semester', 'course', 'created_at']
    search_fields = ['user__username', 'user__email', 'college']
    list_filter = ['semester', 'course']

@admin.register(Syllabus)
class SyllabusAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'status', 'progress', 'uploaded_at')
    list_filter = ('status',)
    
@admin.register(ChatMessage)
class SyllabusAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'created_at', 'role')
