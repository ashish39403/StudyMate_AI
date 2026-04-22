import io
import logging
from celery import shared_task
from pypdf import PdfReader
from .models import Syllabus

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=3)
def extract_text_from_pdf(self, syllabus_id):
    try:
        syllabus = Syllabus.objects.get(id=syllabus_id)
        syllabus.status = "processing"
        syllabus.progress = 0
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
            syllabus.progress = int((i + 1) / total_pages * 100)
            syllabus.save()
        syllabus.extracted_text = extracted_text.strip()
        syllabus.status = "completed"
        syllabus.progress = 100
        syllabus.save()
        return f"Done {syllabus_id}"
    except Exception as e:
        logger.error(str(e))
        try:
            syllabus = Syllabus.objects.get(id=syllabus_id)
            syllabus.status = "failed"
            syllabus.error_message = str(e)
            syllabus.save()
        except:
            pass
        raise self.retry(exc=e, countdown=5)