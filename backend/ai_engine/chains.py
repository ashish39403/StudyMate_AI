"""
Production RAG Chain
- Combines Vector Search + LLM
- Custom prompts for education
- Source citation
- Chat history save
"""
import logging
from langchain_core.prompts import PromptTemplate
from .vectordb import get_or_create_vector_store, search_similar
from .llm_client import generate_response, get_llm
from api.models import ChatMessage
logger = logging.getLogger(__name__)

# Custom prompt for study assistant
STUDY_PROMPT = PromptTemplate(
    template="""🚀 StudyMate AI – Advanced RAG Prompt (v3)

You are StudyMate AI, an expert academic assistant for college students.
Your job is to answer questions strictly using the provided syllabus context only.

📚 Syllabus Context

{context}

❓ Student Question

{question}

🧠 Core Instructions (Very Important)
1. Strict Grounding
Use ONLY the information present in the syllabus context.
Do NOT use external knowledge, assumptions, or general facts.

If information is missing, explicitly say:

"I couldn't find this in your syllabus. Try uploading more notes."

2. Answer Strategy
First identify relevant parts of the context
Then build the answer step-by-step
Combine only relevant syllabus points
Avoid unnecessary explanation
3. Response Style
Clear, structured, and student-friendly
Use headings and bullet points where needed
Keep it concise but conceptually complete
Prefer simplicity over complexity
4. Multi-Concept Questions

If the question involves multiple topics:

Break the answer into sections
Explain each concept separately
Then show final combined understanding (if applicable)
5. Output Format (Strict)

Answer:

Direct final answer in 1–2 lines

Explanation:

Step-by-step breakdown using syllabus context

Key Points (if available):

Bullet list of important syllabus terms

Example (only if present in context):

Simple example derived from syllabus content
6. Safety Rules
Do not hallucinate missing definitions or formulas
Do not expand beyond syllabus scope
Do not guess incomplete information
Stay strictly aligned with context:""",
    input_variables=["context", "question"]
)


def ask_syllabus(syllabus_id: int, question: str, user=None, text: str = None) -> dict:
    """
    Complete RAG pipeline
    """
    logger.info(f"🤔 Processing question for syllabus {syllabus_id}: {question[:50]}...")
    
    try:
        # ✅ FIX: If text provided, ensure vector store exists
        if text:
            from .vectordb import get_or_create_vector_store
            vs = get_or_create_vector_store(syllabus_id=syllabus_id, text=text)
            if not vs:
                logger.error("❌ Failed to create vector store")
        
        # Search relevant context
        relevant_docs = search_similar(syllabus_id, question, k=3)
        
        if not relevant_docs:
            result = {
                "answer": "No relevant content found in this syllabus.",
                "sources": []
            }
            _save_chat_history(syllabus_id, user, question, result)
            return result
        
        # Build context
        context = "\n\n---\n\n".join([
            f"[Source {i+1}]: {doc.page_content}" 
            for i, doc in enumerate(relevant_docs)
        ])
        
        # Format prompt
        prompt = STUDY_PROMPT.format(context=context, question=question)
        
        # Generate answer
        answer = generate_response(prompt)
        
        # Prepare sources
        sources = []
        for doc in relevant_docs:
            sources.append({
                "content": doc.page_content[:300] + "...",
                "metadata": doc.metadata
            })
        
        result = {
            "answer": answer,
            "sources": sources
        }
        
        # Save to chat history
        _save_chat_history(syllabus_id, user, question, result)
        
        return result
        
    except Exception as e:
        logger.error(f"❌ RAG Pipeline Error: {e}")
        return {
            "answer": "Error processing your question.",
            "sources": [],
            "error": str(e)
        }


def _save_chat_history(syllabus_id, user, question, result):
    """
    Save question and answer to chat history database
    """
    if not user:
        logger.warning("⚠️ No user provided, skipping chat history save")
        return
    
    try:
        from api.models import ChatMessage
        
        # Save user message
        ChatMessage.objects.create(
            syllabus_id=syllabus_id,
            user=user,
            role='user',
            content=question
        )
        
        # Save assistant message
        ChatMessage.objects.create(
            syllabus_id=syllabus_id,
            user=user,
            role='assistant',
            content=result.get('answer', ''),
            sources=result.get('sources', [])
        )
        
        logger.info(f"💾 Chat history saved for syllabus {syllabus_id}")
        
    except Exception as e:
        logger.error(f"❌ Failed to save chat history: {e}")