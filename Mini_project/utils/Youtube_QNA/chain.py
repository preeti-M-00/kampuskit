from langchain_core.prompts import PromptTemplate
from langchain_core.runnables import (
    RunnableParallel,
    RunnablePassthrough,
    RunnableLambda
)
from langchain_core.output_parsers import StrOutputParser
from langchain_huggingface import ChatHuggingFace, HuggingFaceEndpoint
from dotenv import load_dotenv


def build_chain(vector_store):

    retriever = vector_store.as_retriever(
        search_type="similarity",
        search_kwargs={"k": 4}
    )

    prompt = PromptTemplate(
        template = """
You are a helpful AI assistant. 
Your task is to answer the user's question using only the information provided in the transcript context below.

Read the context carefully and generate a clear and concise answer based only on that information.
Do not use outside knowledge or make assumptions.

If the context does not contain enough information to answer the question, respond with "I don't know".

Don't mention that you are giving the answer from the transcript. (Don't mention the source. Just give the answer)


{context}
Question: {question}
""",
        input_variables=["context", "question"]
    )

    def format_docs(docs):
        return "\n\n".join(doc.page_content for doc in docs)

    parallel_chain = RunnableParallel({
        "context": retriever | RunnableLambda(format_docs),
        "question": RunnablePassthrough()
    })

    load_dotenv()

    llm = HuggingFaceEndpoint(
        model="Qwen/Qwen2.5-72B-Instruct",
    )

    model = ChatHuggingFace(llm=llm)

    parser = StrOutputParser()

    main_chain = parallel_chain | prompt | model | parser

    return main_chain