import os
import logging
from django.conf import settings
from langchain_openai import ChatOpenAI
from tenacity import retry, stop_after_attempt, wait_exponential


# Prints the log in the cli
logger =logging.getLogger(__name__)

# LLM singleton instance
# Purpose-->Used as a global variable and it loads the llm only once
_llm_instance = None

def get_llm(temperature = 0.4 , max_tokens = 1000):
    global _llm_instance
    if _llm_instance is None:
        logger.info(f"Initializing LLM :{settings.AI_CREDITS_MODEL}")
        
        _llm_instance = ChatOpenAI(
            model=settings.AI_CREDITS_MODEL,
            api_key = settings.AI_CREDITS_API_KEY,
            base_url = settings.AI_CREDITS_BASE_URL,
            temperature=temperature,
            max_tokens = max_tokens,
            request_timeout = 30,
            max_retries = 2
        )
    return _llm_instance

@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=2, max=10)
)
def generate_response(prompt:str) ->str:
    try:
        llm = get_llm()
        response = llm.invoke(prompt)
        logger.info(f"Response Genrated ({len(response.content)})")
        return response.content
    except Exception as e:
        logger.error(f"❌LLM Error {e}")
        raise