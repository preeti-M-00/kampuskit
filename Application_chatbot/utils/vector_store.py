import os
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings


def create_or_load_vector_store(documents, index_path="faiss/faiss_index"):

    embedding = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2"
    )

    # ✅ If index already exists → load it
    if os.path.exists(index_path):
        vector_store = FAISS.load_local(
            index_path,
            embedding,
            allow_dangerous_deserialization=True
        )
        return vector_store

    # ✅ Otherwise create and save
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=700,
        chunk_overlap=150
    )

    chunks = splitter.split_documents(documents)

    vector_store = FAISS.from_documents(
        documents=chunks,
        embedding=embedding
    )

    vector_store.save_local(index_path)

    return vector_store