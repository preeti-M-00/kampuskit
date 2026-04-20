export const LEARNING_API_PATHS = {
    DOCUMENTS: {
        UPLOAD: "/api/documents/upload",
        GET_DOCUMENTS: "/api/documents",
        GET_DOCUMENT_BY_ID: (id) => `/api/documents/${id}`,
        DELETE_DOCUMENT: (id) => `/api/documents/${id}`,
    },
    AI: {
        GENERATE_FLASHCARDS: "/api/learning-ai/flashcards",
        GENERATE_QUIZ: "/api/learning-ai/generate-quiz",
        GENERATE_SUMMARY: "/api/learning-ai/generate-summary",
        CHAT: "/api/learning-ai/chat",
        EXPLAIN_CONCEPT: "/api/learning-ai/explain-concept",
        GET_CHAT_HISTORY: (documentId) => `/api/learning-ai/chat-history/${documentId}`,
    },
    FLASHCARDS: {
        GET_ALL_FLASHCARD_SETS: "/api/flashcards",
        GET_FLASHCARDS_FOR_DOC: (documentId) => `/api/flashcards/${documentId}`,
        REVIEW_FLASHCARD: (cardId) => `/api/flashcards/${cardId}/review`,
        TOGGLE_STAR: (cardId) => `/api/flashcards/${cardId}/star`,
        DELETE_FLASHCARD_SET: (id) => `/api/flashcards/${id}`,
    },
    QUIZZES: {
        GET_ALL_QUIZZES: "/api/quizzes/all",
        GET_QUIZZES_FOR_DOC: (documentId) => `/api/quizzes/${documentId}`,
        GET_QUIZ_BY_ID: (id) => `/api/quizzes/quiz/${id}`,
        SUBMIT_QUIZ: (id) => `/api/quizzes/${id}/submit`,
        GET_QUIZ_RESULTS: (id) => `/api/quizzes/${id}/results`,
        DELETE_QUIZ: (id) => `/api/quizzes/${id}`,
        TOGGLE_SHARE_QUIZ: (id) => `/api/quizzes/${id}/share`, 
        GET_PUBLIC_QUIZ: (id) => `/api/quizzes/public/${id}`, 
        SUBMIT_PUBLIC_QUIZ: (id) => `/api/quizzes/public/${id}/submit`, 
    },
    PROGRESS: {
        GET_DASHBOARD: "/api/progress/dashboard"
    },
};