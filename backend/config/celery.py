import os
from celery import Celery

# Django setting module setting up
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

app = Celery("studymate")

app.config_from_object('django.conf:settings' , namespace='CELERY')

app.autodiscover_tasks()

@app.task(bind = True , ignore_result = True)
def debug_task(self):
    print(f"Request: {self.request!r}")