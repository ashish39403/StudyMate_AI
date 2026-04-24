"""
Production RAG Chain
- Combines Vector Search + LLM
- Custom prompts for education
- Source citation
"""
import logging
from langchain_core.prompts import PromptTemplate
from .vectordb import get_or_create_vector_store, search_similar
from .llm_client import generate_response, get_llm

logger = logging.getLogger(__name__)

# Custom prompt for study assistant
STUDY_PROMPT = PromptTemplate(
    template="""You are StudyMate AI, an expert study assistant for college students.
    
Your task is to answer questions based ONLY on the provided syllabus context.
If the answer is not in the context, say "I couldn't find this in your syllabus. Try uploading more notes."

Guidelines:
- Be clear and educational
- Use examples when helpful
- Keep answers concise but complete
- If multiple concepts are involved, explain step by step

Context from syllabus:
{context}

Student's Question: {question}

Answer:""",
    input_variables=["context", "question"]
)


def ask_syllabus(syllabus_id: int, question: str) -> dict:
    """
    Complete RAG pipeline for asking questions about a syllabus
    
    Args:
        syllabus_id: ID of the syllabus
        question: Student's question
        
    Returns:
        dict with 'answer' and 'sources'
    """
    logger.info(f"🤔 Processing question for syllabus {syllabus_id}: {question[:50]}...")
    
    try:
        # Step 1: Search relevant context
        relevant_docs = search_similar(syllabus_id, question, k=3)
        
        if not relevant_docs:
            return {
                "answer": "No relevant content found in this syllabus.",
                "sources": []
            }
        
        # Step 2: Build context
        context = "\n\n---\n\n".join([
            f"[Source {i+1}]: {doc.page_content}" 
            for i, doc in enumerate(relevant_docs)
        ])
        
        # Step 3: Format prompt
        prompt = STUDY_PROMPT.format(
            context=context,
            question=question
        )
        
        # Step 4: Generate answer
        answer = generate_response(prompt)
        
        # Step 5: Prepare sources
        sources = []
        for doc in relevant_docs:
            sources.append({
                "content": doc.page_content[:300] + "...",
                "metadata": doc.metadata
            })
        
        logger.info(f"✅ Answer generated ({len(answer)} chars)")
        
        return {
            "answer": answer,
            "sources": sources
        }
        
    except Exception as e:
        logger.error(f"❌ RAG Pipeline Error: {e}")
        return {
            "answer": f"I encountered an error processing your question. Please try again.",
            "sources": [],
            "error": str(e)
        }