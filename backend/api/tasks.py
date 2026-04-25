import io
import logging
from celery import shared_task
from pypdf import PdfReader
from .models import Syllabus
from ai_engine.vectordb import get_or_create_vector_store

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=3)
def process_syllabus(self, syllabus_id):
    try:
        syllabus = Syllabus.objects.get(id=syllabus_id)

        syllabus.status = "processing"
        syllabus.progress = 5
        syllabus.save()

        with syllabus.file.open('rb') as pdf_file:
            pdf_content = io.BytesIO(pdf_file.read())

        reader = PdfReader(pdf_content)
        extracted_text = ""
        total_pages = len(reader.pages)

        for i, page in enumerate(reader.pages):
            text = page.extract_text()
            if text:
                extracted_text += text + "\n"

            progress = 5 + int((i + 1) / total_pages * 45)
            syllabus.progress = progress
            syllabus.save()

        syllabus.extracted_text = extracted_text.strip()
        syllabus.save()

        # Vector DB stage
        syllabus.progress = 70
        syllabus.save()

        get_or_create_vector_store(
            syllabus_id=syllabus_id,
            text=extracted_text
        )

        syllabus.progress = 90
        syllabus.save()

        syllabus.progress = 100
        syllabus.is_processed = True
        syllabus.status = "completed"
        syllabus.save()

        return f"Done {syllabus_id}"

    except Exception as e:
        syllabus = Syllabus.objects.get(id=syllabus_id)
        syllabus.status = "failed"
        syllabus.error_message = str(e)
        syllabus.is_processed = False
        syllabus.save()

        raise self.retry(exc=e, countdown=5)