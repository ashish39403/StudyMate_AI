from django.contrib import admin
from .models import UserProfile, Syllabus

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'college', 'semester', 'course', 'created_at']
    search_fields = ['user__username', 'user__email', 'college']
    list_filter = ['semester', 'course']

@admin.register(Syllabus)
class SyllabusAdmin(admin.ModelAdmin):
    list_display = ['title', 'user', 'is_processed', 'uploaded_at']
    search_fields = ['title', 'user__username']
    list_filter = ['is_processed', 'uploaded_at']
    readonly_fields = ['extracted_text']