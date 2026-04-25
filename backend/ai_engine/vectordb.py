"""
Vector Database Service - FAISS Version
"""
import os
import time
import logging
from langchain_community.vectorstores import FAISS
from langchain_text_splitters import RecursiveCharacterTextSplitter
from .embeddings import get_embedding_model

logger = logging.getLogger(__name__)

VECTOR_DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'vector_db')
os.makedirs(VECTOR_DB_PATH, exist_ok=True)

def get_text_splitter():
    return RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200,
        separators=["\n\n", "\n", ".", "!", "?", " ", ""],
    )

def get_or_create_vector_store(syllabus_id: int, text: str = None):
    """Get existing or create new FAISS vector store"""
    embeddings = get_embedding_model()
    index_path = os.path.join(VECTOR_DB_PATH, f"syllabus_{syllabus_id}")
    
    # Try loading existing
    if os.path.exists(index_path):
        try:
            vector_store = FAISS.load_local(
                index_path, 
                embeddings,
                allow_dangerous_deserialization=True
            )
            logger.info(f"📂 Loaded: syllabus_{syllabus_id}")
            return vector_store
        except Exception as e:
            logger.warning(f"⚠️ Failed to load: {e}")
    
    # Create new if text provided
    if text and text.strip():
        try:
            logger.info(f"🔨 Creating: syllabus_{syllabus_id}")
            
            splitter = get_text_splitter()
            chunks = splitter.split_text(text)
            logger.info(f"📄 Chunks: {len(chunks)}")
            
            if not chunks:
                return None
            
            vector_store = FAISS.from_texts(
                texts=chunks,
                embedding=embeddings
            )
            
            # Save locally
            vector_store.save_local(index_path)
            logger.info(f"✅ Created & Saved: syllabus_{syllabus_id}")
            
            return vector_store
            
        except Exception as e:
            logger.error(f"❌ Error: {e}")
            import traceback
            traceback.print_exc()
            return None
    
    return None

def search_similar(syllabus_id: int, query: str, k: int = 3):
    """Search similar chunks"""
    vector_store = get_or_create_vector_store(syllabus_id)
    
    if not vector_store:
        return []
    
    try:
        results = vector_store.similarity_search(query, k=k)
        logger.info(f"🔍 Found {len(results)} results")
        return results
    except Exception as e:
        logger.error(f"❌ Search error: {e}")
        return []

def force_create_vector_store(syllabus_id: int):
    """Force create from syllabus text"""
    from api.models import Syllabus
    
    try:
        syllabus = Syllabus.objects.get(id=syllabus_id)
        
        if not syllabus.extracted_text:
            return False
        
        vs = get_or_create_vector_store(
            syllabus_id=syllabus_id,
            text=syllabus.extracted_text
        )
        
        if vs:
            syllabus.is_processed = True
            syllabus.status = "completed"
            syllabus.progress = 100
            syllabus.save()
            return True
        return False
    except Exception as e:
        logger.error(f"❌ Error: {e}")
        return False

def delete_vector_store(syllabus_id: int):
    """Delete FAISS index"""
    import shutil
    index_path = os.path.join(VECTOR_DB_PATH, f"syllabus_{syllabus_id}")
    
    if os.path.exists(index_path):
        shutil.rmtree(index_path)
        return True
    return False