from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
# Create your models here.


class UserProfile(models.Model):
    user = models.OneToOneField(User , on_delete=models.CASCADE , related_name='profile')
    college = models.CharField(max_length=400 , blank=True , null=True)
    semester = models.IntegerField(blank=True , null=True)
    course = models.CharField(max_length=400 , blank=True , null=True)
    avatar = models.ImageField(upload_to='avatars/', blank=True , null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.user.username}'s Profile"
    
class Syllabus(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='syllabi')
    title = models.CharField(max_length=150)
    file = models.FileField(upload_to='syllabi/')
    extracted_text = models.TextField(blank=True , null=True)
    is_processed = models.BooleanField(default=False)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.titled - {self.user.username}}"
    
    class Meta:
        verbose_name_plural = "Syllabi"