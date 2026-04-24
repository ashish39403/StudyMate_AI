"""
Production Vector Database Service
- Manages per-user vector stores
- Handles chunking strategy
- Provides search functionality
"""
import os
import time
import logging
import lancedb
from langchain_community.vectorstores import LanceDB
from langchain_text_splitters import RecursiveCharacterTextSplitter
from .embeddings import get_embedding_model

logger = logging.getLogger(__name__)

VECTOR_DB_PATH = os.path.join(os.path.dirname(__file__), '..', 'vector_db')

# Ensure directory exists
os.makedirs(VECTOR_DB_PATH, exist_ok=True)

def get_text_splitter():
    """Returns configured text splitter"""
    return RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200,
        separators=["\n\n", "\n", ".", "!", "?", " ", ""],
        length_function=len,
    )

def get_or_create_vector_store(syllabus_id: int, text: str = None):
    embeddings = get_embedding_model()
    db = lancedb.connect(VECTOR_DB_PATH)
    table_name = f"syllabus_{syllabus_id}"
    
    # Return existing
    if table_name in db.table_names():
        logger.info(f"📂 Loading existing vector store: {table_name}")
        
        return LanceDB(
            connection=db,
            table_name=table_name,
            embedding=embeddings
        )
    
    # Create new
    if text:
        logger.info(f"🔨 Creating vector store for syllabus {syllabus_id}")
        start = time.time()
        
        splitter = get_text_splitter()
        chunks = splitter.split_text(text)
        
        logger.info(f"📄 Split into {len(chunks)} chunks")
        
        vector_store = LanceDB.from_texts(
            texts=chunks,
            embedding=embeddings,
            connection=db,
            table_name=table_name
        )
        
        elapsed = time.time() - start
        logger.info(f"✅ Vector store created in {elapsed:.2f}s")
        
        return vector_store
    
    return None

def search_similar(syllabus_id: int, query: str, k: int = 3):
    """
    Search similar chunks for a query
    """
    vector_store = get_or_create_vector_store(syllabus_id)
    
    if not vector_store:
        logger.warning(f"⚠️ No vector store for syllabus {syllabus_id}")
        return []
    
    start = time.time()
    results = vector_store.similarity_search(query, k=k)
    elapsed = time.time() - start
    
    logger.info(f"🔍 Found {len(results)} results in {elapsed:.2f}s")
    
    return results

def delete_vector_store(syllabus_id: int):
    """
    Delete vector store for a syllabus
    """
    db = lancedb.connect(VECTOR_DB_PATH)
    table_name = f"syllabus_{syllabus_id}"
    
    if table_name in db.table_names():
        db.drop_table(table_name)
        logger.info(f"🗑️ Deleted vector store: {table_name}")
        return True
    
    return False

def get_vector_store_stats():
    """
    Get statistics about vector stores
    """
    db = lancedb.connect(VECTOR_DB_PATH)
    tables = db.table_names()
    
    stats = {
        "total_stores": len(tables),
        "stores": tables
    }
    
    logger.info(f"📊 Vector DB Stats: {stats}")
    return stats