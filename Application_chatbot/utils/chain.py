from langchain_core.prompts import PromptTemplate
from langchain_core.runnables import RunnableParallel, RunnablePassthrough, RunnableLambda
from langchain_core.output_parsers import StrOutputParser
from langchain_huggingface import ChatHuggingFace, HuggingFaceEndpoint
from dotenv import load_dotenv


def build_chain(vector_store):

    retriever = vector_store.as_retriever(
        search_type="similarity",
        search_kwargs={"k": 4}
    )

    prompt = PromptTemplate(
    template="""
You are a customer support assistant for this application.

You must behave like a native support agent inside the application.

====================
CONVERSATION HISTORY
====================
{chat_history}

====================
APPLICATION INFORMATION
====================
{context}

====================
CURRENT USER QUESTION
====================
{question}

====================
STRICT RULES
====================

1. Answer naturally as if this is built-in application knowledge.

2. NEVER say:
   - "according to documentation"
   - "based on the documentation"
   - "as mentioned in the documentation"
   - "the documentation says"
   - "retrieved context"
   - "system information"
   - "internal files"
   - "knowledge base"

3. NEVER mention that you are using documents, context, embeddings, vector store, or any stored data.

4. Speak confidently and directly.

5. Only help with user-facing issues:
   - Errors
   - Bugs
   - Login issues
   - Upload failures
   - Features not working
   - Performance issues
   - UI confusion
   - How to fix something

6. If asked about backend, APIs, database, system design, AI models, or implementation details:

Respond EXACTLY with:
"I'm here to help with application issues and troubleshooting. I can't provide internal system details."

Do not add anything after that sentence.

7. If the answer is unavailable:
Say:
"I don't have enough information to help with that."

8. Provide step-by-step troubleshooting guidance when needed.

Now answer the user naturally.
""",
    input_variables=["chat_history", "context", "question"]
)

    def format_docs(docs):
        return "\n\n".join(doc.page_content for doc in docs)

    parallel_chain = RunnableParallel({
    "context": lambda x: format_docs(
    retriever.invoke(x["chat_history"] + "\nUser: " + x["question"])),
    "question": lambda x: x["question"],
    "chat_history": lambda x: x["chat_history"]
})

    load_dotenv()

    llm = HuggingFaceEndpoint(
        model="meta-llama/Llama-3.1-8B-Instruct",
        temperature = 0.2
    )

    model = ChatHuggingFace(llm=llm)

    parser = StrOutputParser()

    main_chain = parallel_chain | prompt | model | parser

    return main_chain