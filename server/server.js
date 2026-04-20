import express from "express";
import cors from "cors";
import 'dotenv/config';
import cookieParser from "cookie-parser";
import connectDB from "./config/mongodb.js";
import authRouter from "./routes/authRoutes.js";
import userRouter from "./routes/userRoutes.js";
import noteRoutes from "./routes/noteRoutes.js";
import resumeRouter from "./routes/resumeRoutes.js";
import aiRouter from "./routes/aiRoutes.js";
// import pdfRouter from "./routes/pdfRoutes.js";
import historyRouter from "./routes/history.js";
import documentRoutes from "./routes/documentRoutes.js";
import flashcardRoutes from "./routes/flashcardRoutes.js";
import quizRoutes from "./routes/quizRoutes.js";
import progressRoutes from "./routes/progressRoutes.js";
import learningAiRoutes from "./routes/learningAiRoutes.js";

const app = express();
//port number
const port = process.env.PORT || 4000
connectDB();

const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
  process.env.PDF_SUMMARIZER_URL || 'http://localhost:3000'
]

// const noteRoutes = require("./routes/noteRoutes.js");

app.use(express.json()); //all requests would be passed from json
app.use(cookieParser());
app.use(cors({origin: allowedOrigins, credentials: true})); //so that we can send the cookies in the response from the express app

//API endpoints
app.get('/',(req,res)=>res.send("API working"));
app.use('/api/auth',authRouter);
app.use('/api/user', userRouter);
app.use("/api/notes",noteRoutes);
app.use("/api/resumes",resumeRouter);
app.use("/api/ai",aiRouter);
// app.use("/api",pdfRouter);
app.use("/api/history", historyRouter);
app.use("/api/documents", documentRoutes);
app.use("/api/flashcards", flashcardRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/learning-ai", learningAiRoutes);

// In server.js
// app.post('/api/ai/chat', async (req, res) => {
//     try {
//         const { message } = req.body;
//         res.json({ response: `You said: ${message}` }); // Note: updated to 'response' to match your frontend code
//     } catch (error) {
//         res.status(500).json({ error: "Something went wrong" });
//     }
// });

app.listen(port, ()=>{
    console.log(`Server started on PORT:http://localhost:${port}`)
})