import io
import logging
from celery import shared_task
from pypdf import PdfReader
from .models import Syllabus
from ai_engine.vectordb import get_or_create_vector_store

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=3)
def process_syllabus(self, syllabus_id):
    """
    FULL PIPELINE:
    PDF → Extract → Vector DB → Ready
    """
    try:
        syllabus = Syllabus.objects.get(id=syllabus_id)

        # 🔵 START
        syllabus.status = "processing"
        syllabus.progress = 0
        syllabus.save()

        # 🔵 STEP 1: Extract text
        with syllabus.file.open('rb') as pdf_file:
            pdf_content = io.BytesIO(pdf_file.read())

        reader = PdfReader(pdf_content)

        extracted_text = ""
        total_pages = len(reader.pages)

        for i, page in enumerate(reader.pages):
            text = page.extract_text()
            if text:
                extracted_text += text + "\n"

            # progress till 50%
            syllabus.progress = int((i + 1) / total_pages * 50)
            syllabus.save()

        syllabus.extracted_text = extracted_text.strip()
        syllabus.save()

        # 🟣 STEP 2: Vector DB create (chunk + embed + store)
        get_or_create_vector_store(
            syllabus_id=syllabus_id,
            text=extracted_text
        )

        # progress 100%
        syllabus.progress = 100
        syllabus.status = "completed"
        syllabus.is_processed = True
        syllabus.save()

        logger.info(f"✅ Syllabus {syllabus_id} fully processed")

        return f"✅ Done {syllabus_id}"

    except Exception as e:
        logger.error(f"❌ Error: {str(e)}")

        try:
            syllabus = Syllabus.objects.get(id=syllabus_id)
            syllabus.status = "failed"
            syllabus.error_message = str(e)
            syllabus.is_processed = False
            syllabus.save()
        except:
            pass

        raise self.retry(exc=e, countdown=5)