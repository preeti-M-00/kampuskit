from fastapi import FastAPI
from pydantic import BaseModel
from utils.vector_store import create_or_load_vector_store
from utils.chain import build_chain
from fastapi.middleware.cors import CORSMiddleware
from uuid import uuid4
from datetime import datetime

app = FastAPI()

# ---------------- CORS ----------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------- SERVER START TIME ----------------
SERVER_START_TIME = str(datetime.utcnow())

@app.get("/health")
def health():
    return {"server_start_time": SERVER_START_TIME}

# ---------------- LOAD VECTOR STORE ----------------
vector_store = create_or_load_vector_store(None)
chain = build_chain(vector_store)

# ---------------- SESSION STORAGE ----------------
sessions = {}

class Query(BaseModel):
    question: str
    session_id: str | None = None


@app.post("/chat")
def chat(query: Query):

    # 1️⃣ Create or load session
    if not query.session_id:
        session_id = str(uuid4())
        sessions[session_id] = []
    else:
        session_id = query.session_id
        if session_id not in sessions:
            sessions[session_id] = []

    # 2️⃣ Exit phrases
    text = query.question.lower().strip()

    exit_keywords = [
        "no", "nothing", "that's all",
        "no more", "no other",
        "no thanks", "thank you",
        "thanks", "ok", "okay", "done"
    ]

    if len(text.split()) <= 4 and any(keyword in text for keyword in exit_keywords):
        return {
            "response": "Alright! If you need help later, feel free to ask.",
            "session_id": session_id
        }

    # 3️⃣ RAG Flow
    chat_history = sessions[session_id]
    history_text = "\n".join(chat_history)

    response = chain.invoke({
        "question": query.question,
        "chat_history": history_text
    })

    chat_history.append(f"User: {query.question}")
    chat_history.append(f"Assistant: {response}")

    return {
        "response": response,
        "session_id": session_id
    }