import express from "express"
import { enhanceJobDescription, enhanceProfessionalSummary, uploadResume } from "../controllers/aiController.js"
import userAuth from "../middleware/userAuth.js";

const aiRouter = express.Router()

aiRouter.post('/enhance-pro-sum',userAuth,enhanceProfessionalSummary)
aiRouter.post('/enhance-job-desc',userAuth,enhanceJobDescription)
aiRouter.post('/upload-resume',userAuth,uploadResume)

aiRouter.post('/chat', async (req, res) => {
    try {
        const { message, session_id } = req.body;

        const response = await fetch(`${process.env.CHATBOT_URL}/chat`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                question: message,
                session_id: session_id || null
            })
        });

        const data = await response.json();

        res.json({
            reply: data.response,         // frontend expects 'reply'
            session_id: data.session_id
        });
    } catch (error) {
        console.error("Python chatbot error:", error);
        res.status(500).json({ error: "Something went wrong" });
    }
});

export default aiRouter