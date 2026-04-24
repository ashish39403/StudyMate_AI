import time 
import os
import logging
from langchain_community.embeddings import HuggingFaceEmbeddings

logger  = logging.getLogger(__name__)

_embedding_model = None


def get_embedding_model():
    global _embedding_model
    if _embedding_model is None:
        logger.info("🔄 Loading embedding model (first time only)...")
        start = time.time()
        
        try:
            _embedding_model = HuggingFaceEmbeddings(
                model_name = "sentence-transformers/all-MiniLM-L6-v2",
                model_kwargs={'device': 'cpu'},
                encode_kwargs = {
                    "normalize_embeddings":True,
                    'batch_size':128
                }
            )
            load_time = time.time() - start
            logger.info(f"✅ Embedding model loaded in {load_time:.2f}s")
        except Exception as e:
            logger.error(f"❌Failed to load embedding model:{e}")
            raise
    return _embedding_model

def create_embeddings(texts:list)->list:
    model = get_embedding_model()
    start = time.time()
    vectors = model.embed_documents(texts)
    elapsed = time.time() -start
    logger.info(f"📊 Generated {len(vectors)} embeddings in {elapsed:.2f}s")
    return vectors
    