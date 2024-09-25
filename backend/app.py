import requests
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import faiss
import numpy as np
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import cohere
import os
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
from langchain_community.tools.tavily_search.tool import TavilySearchResults
from langchain_community.utilities.tavily_search import TavilySearchAPIWrapper 

load_dotenv()
api_key = os.getenv('COHERE_API_KEY')
tavily_apikey = os.getenv('TAVILY_API_KEY')

if not api_key:
    raise RuntimeError("COHERE_API_KEY not set in the environment")
print("COHERE_API_KEY loaded successfully")

if not tavily_apikey:
    raise RuntimeError("TAVILY_API_KEY not set in the environment")
print("TAVILY_API_KEY loaded successfully")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

model = SentenceTransformer('all-MiniLM-L6-v2')
index = faiss.read_index("vector_db.index")
vectors = np.load("vectors.npy")


class Query(BaseModel):
    query: str
    use_web_search: bool = False 
with open("sentences.txt", "r", encoding="utf-8") as f:
    sentences = f.read().splitlines()

co = cohere.Client(api_key)

class Query(BaseModel):
    query: str

def query_vector_db(query: str, k: int = 10) -> list[int]:
    query_vector = model.encode([query])
    distances, indices = index.search(query_vector, k)
    result_indices = indices[0]

    # Avoid out of bounds indices
    max_index = len(vectors)
    result_indices = [i for i in result_indices if i < max_index]

    result_vectors = [vectors[i] for i in result_indices]
    similarities = cosine_similarity(query_vector, result_vectors)[0]
    sorted_indices = np.argsort(similarities)[::-1]
    return [result_indices[i] for i in sorted_indices[:k]]

def generate_response(prompt: str, context: str) -> str:
    response = co.generate(
        model='command-r-plus',
        prompt=f"{context}\n\nQuestion: {prompt}",
        max_tokens=150
    )
    return response.generations[0].text


def retrieve_context(query: str) -> str:
    indices = query_vector_db(query)
    print(f"Query: {query}, Indices: {indices}")  # Log indices
    results = [sentences[i] for i in indices if len(sentences[i]) > 30 and "." in sentences[i]]
    print(f"Retrieved Results: {results}")  # Log retrieved sentences
    return " ".join(results)

def is_query_related_to_sound(query: str) -> str:
    classification_response = co.generate(
        model='command-r-plus',
        prompt=f"Is the following query related to sound? Respond with 'yes' or 'no': '{query}'",
        max_tokens=5
    )
    classification_answer = classification_response.generations[0].text.strip().lower()
    return classification_answer

# Initialize the TavilySearchAPIWrapper with the API key
api_wrapper = TavilySearchAPIWrapper(
    tavily_api_key=  tavily_apikey
)

# Initialize the Tavily search tool with the api_wrapper
tavily_search = TavilySearchResults(
    max_results=5,                
    include_answer=True,         
    include_raw_content=False,    
    include_images=False,         
    api_wrapper=api_wrapper       
)

class TavilyQuery(BaseModel):
    query: str

@app.post("/tavily-search")
def tavily_search_endpoint(query: TavilyQuery):
    try:
        results, raw_results = tavily_search._run(query.query)
        
        if results:
            return {"results": results}  
        else:
            return {"response": "No relevant information found."}
    except Exception as e:
        print(f"Error occurred during Tavily search: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")

@app.post("/query")
def query_endpoint(query: Query):
    try:
        context = retrieve_context(query.query)
        if not context:
            return {"response": "I'm unable to find relevant information in the textbook."}
        
        response = generate_response(query.query, context)
        return {"response": response}
    except Exception as e:
        print(f"Error occurred: {e}")  
        raise HTTPException(status_code=500, detail="Internal Server Error")


@app.post("/agent")
def agent_endpoint(query: Query):
    try:
        sound_related = is_query_related_to_sound(query.query)
        print(f"Query: '{query.query}' is related to sound: {sound_related}")  # Log sound classification

        if sound_related == "yes":
            context = retrieve_context(query.query)
            if not context:
                return {"response": "I'm unable to find relevant information in the textbook.", "suggest_web_search": True}
            
            response = generate_response(query.query, context)
            return {"response": response, "suggest_web_search": False}  
        else:
            response = generate_response(query.query, "")
            return {"response": response, "suggest_web_search": True}  

    except Exception as e:
        print(f"Error occurred: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")
    
@app.post("/web-search")
def web_search_endpoint(query: Query):
    try:
        print("Performing Tavily web search...")
        results, raw_results = tavily_search._run(query.query)

        if results:
            best_result = results[0]  
            return {"response": best_result}
        else:
            return {"response": "No relevant information found using Tavily search."}
    
    except Exception as e:
        print(f"Error occurred during Tavily search: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
