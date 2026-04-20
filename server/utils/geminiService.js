import dotenv from 'dotenv';
import Groq from 'groq-sdk';

dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

if (!process.env.GROQ_API_KEY) {
    console.error('FATAL ERROR: GROQ_API_KEY is not set in the environment variables.');
    process.exit(1);
}

export const generateFlashcards = async (text, count = 10) => {
    const prompt = `Generate exactly ${count} educational flashcards from the following text. Format each flashcard as:
    Q: [Clear, specific question]
    A: [Concise, accurate answer]
    D: [Difficulty level: easy, medium, or hard]

    Separate each flashcard with "---"

    Text:
    ${text.substring(0, 15000)}`;

    try {
        const response = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [{ role: "user", content: prompt }],
            max_tokens: 2048,
        });

        const generatedText = response.choices[0].message.content;
        const flashcards = [];
        const cards = generatedText.split('---').filter(c => c.trim());

        for (const card of cards) {
            const lines = card.trim().split('\n');
            let question = '', answer = '', difficulty = 'medium';

            for (const line of lines) {
                if (line.startsWith('Q:')) question = line.substring(2).trim();
                else if (line.startsWith('A:')) answer = line.substring(2).trim();
                else if (line.startsWith('D:')) {
                    const diff = line.substring(2).trim().toLowerCase();
                    if (['easy', 'medium', 'hard'].includes(diff)) difficulty = diff;
                }
            }

            if (question && answer) flashcards.push({ question, answer, difficulty });
        }

        return flashcards.slice(0, count);
    } catch (error) {
        console.error('Groq API error:', error);
        throw new Error('Failed to generate flashcards');
    }
};

export const generateQuiz = async (text, numQuestions = 5, difficulty = 'medium') => {
    const prompt = `Generate exactly ${numQuestions} multiple choice questions from the following text.
    The difficulty of these questions MUST BE strictly: ${difficulty.toUpperCase()}.
    Format EACH question EXACTLY as shown below (no deviations):
    Q: [Question text]
    O1: [Option 1 text]
    O2: [Option 2 text]
    O3: [Option 3 text]
    O4: [Option 4 text]
    C: O1
    E: [Brief explanation]
    D: [easy, medium, or hard]

    CRITICAL RULES:
    - C: must be ONLY one of: O1, O2, O3, or O4 — nothing else, no full text
    - Separate questions with "---"
    - Do NOT number the questions

    Text:
    ${text.substring(0, 15000)}`;

    try {
        const response = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [{ role: "user", content: prompt }],
            max_tokens: 2048,
        });

        const generatedText = response.choices[0].message.content;
        const questions = [];
        const questionBlocks = generatedText.split('---').filter(q => q.trim());

        for (const block of questionBlocks) {
            const lines = block.trim().split('\n');
            let question = '', options = [], correctAnswer = '', explanation = '', difficulty = 'medium';

            for (const line of lines) {
                const trimmed = line.trim();
                if (trimmed.startsWith('Q:')) question = trimmed.substring(2).trim();
                else if (trimmed.match(/^O\d:/)) options.push(trimmed.substring(3).trim());
                else if (trimmed.startsWith('C:')) correctAnswer = trimmed.substring(2).trim();
                else if (trimmed.startsWith('E:')) explanation = trimmed.substring(2).trim();
                else if (trimmed.startsWith('D:')) {
                    const diff = trimmed.substring(2).trim().toLowerCase();
                    if (['easy', 'medium', 'hard'].includes(diff)) difficulty = diff;
                }
            }

            if (question && options.length === 4 && correctAnswer) {
                // Resolve correctAnswer to actual option text
                let resolvedAnswer = correctAnswer;

                if (resolvedAnswer.match(/^[Oo]\d+$/)) {
                    // AI used O1/O2 code format (what we want) — convert to option text
                    const optionNum = parseInt(resolvedAnswer.substring(1)) - 1;
                    if (optionNum >= 0 && optionNum < options.length) {
                        resolvedAnswer = options[optionNum];
                    }
                } else {
                    // AI returned full text despite instructions — do multi-level matching
                    const normalizedRaw = resolvedAnswer.toLowerCase().replace(/\s+/g, ' ').trim();
                    const normalizedOptions = options.map(o => o.toLowerCase().replace(/\s+/g, ' ').trim());

                    // 1. Exact match
                    let matchIdx = normalizedOptions.findIndex(o => o === normalizedRaw);

                    // 2. One starts with the other (handles truncation/extension)
                    if (matchIdx === -1) {
                        matchIdx = normalizedOptions.findIndex(
                            o => o.startsWith(normalizedRaw) || normalizedRaw.startsWith(o)
                        );
                    }

                    // 3. One contains the other
                    if (matchIdx === -1) {
                        matchIdx = normalizedOptions.findIndex(
                            o => o.includes(normalizedRaw) || normalizedRaw.includes(o)
                        );
                    }

                    if (matchIdx !== -1) {
                        resolvedAnswer = options[matchIdx]; // Use canonical option casing
                    }
                    // If still no match, keep the raw text as last resort
                }

                questions.push({ question, options, correctAnswer: resolvedAnswer, explanation, difficulty });
            }
        }

        return questions.slice(0, numQuestions);
    } catch (error) {
        console.error('Groq API error:', error);
        throw new Error('Failed to generate quiz');
    }
};

export const generateSummary = async (text) => {
    const prompt = `Provide a concise summary of the following text, highlighting the key concepts, main ideas, and important points. Keep the summary clear and structured.

    Text:
    ${text.substring(0, 20000)}`;

    try {
        const response = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [{ role: "user", content: prompt }],
            max_tokens: 1024,
        });

        return response.choices[0].message.content;
    } catch (error) {
        console.error('Groq API error:', error);
        throw new Error('Failed to generate summary');
    }
};

export const chatWithContext = async (question, chunks) => {
    // Handle greetings directly
    const greetings = ['hi', 'hello', 'hey', 'hii', 'helo'];
    if (greetings.includes(question.toLowerCase().trim())) {
        return "Hello! I'm your study assistant. Ask me anything about this document and I'll help you understand it!";
    }

    const cleanedChunks = chunks
        .map(c => c.content
            .replace(/\[Chunk\s*\d+\]/g, '')
            .replace(/\s+/g, ' ')
            .trim()
        )
        .filter(c => {
            if (c.length < 50) return false;
            const words = c.split(' ');
            const shortTokens = words.filter(w => w.length <= 2).length;
            const ratio = shortTokens / words.length;
            return ratio < 0.4;
        })
        .slice(0, 3);

    const context = cleanedChunks.length > 0
        ? cleanedChunks.join('\n\n')
        : chunks.map(c => c.content).join(' ').substring(0, 3000);

    try {
        const response = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
                {
                    role: "user",
                    content: `I have a question: "${question}"

Here is relevant text from a document:
"""
${context}
"""

Based on the above, write a clear 2-3 sentence answer in your own words. Do not copy the text above verbatim.`
                }
            ],
            max_tokens: 256,
            temperature: 0.7,
        });

        return response.choices[0].message.content;
    } catch (error) {
        console.error('Groq API error:', error);
        throw new Error('Failed to process chat request');
    }
};

export const explainConcept = async (concept, context) => {
    const prompt = `Explain the concept of "${concept}" based on the following context. Provide a clear, educational explanation that's easy to understand. Include examples if relevant.

    Context:
    ${context.substring(0, 10000)}`;

    try {
        const response = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [{ role: "user", content: prompt }],
            max_tokens: 1024,
        });

        return response.choices[0].message.content;
    } catch (error) {
        console.error('Groq API error:', error);
        throw new Error('Failed to explain concept');
    }
};