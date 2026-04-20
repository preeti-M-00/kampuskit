# PDF Summarizer AI — Powered by Groq

A beautiful PDF summarizer application with a deep purple gradient UI, powered by Groq's ultra-fast LLM API.

## Features

- 📄 **PDF Upload** — Drag & drop or browse to upload PDFs
- ⚡ **Three Summary Lengths** — Short (150–250w), Medium (400–600w), Long (800–1200w)
- 🧠 **Groq LLM** — Powered by Llama 3 via Groq for lightning-fast summaries
- 📝 **Structured Output** — Summaries with Overview, Key Points, Details & Conclusion
- 👁️ **In-app Viewer** — Read your summary directly in the app
- 📥 **PDF Download** — Download beautifully formatted summary as PDF
- 🕐 **History** — View and manage all past summaries

## Project Structure

```
pdf-summarizer/
├── backend/
│   ├── app.py              # Flask API
│   ├── requirements.txt    # Python dependencies
│   └── .env.example        # Environment variable template
├── frontend/
│   ├── src/
│   │   ├── App.jsx         # Main React component
│   │   ├── main.jsx        # Entry point
│   │   └── index.css       # Global styles
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
└── README.md
```

## Setup & Running

### 1. Get a Groq API Key
Sign up free at [console.groq.com](https://console.groq.com) and create an API key.

### 2. Backend Setup

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# (Optional) Set API key in environment
cp .env.example .env
# Edit .env and add: GROQ_API_KEY=your_key_here

# Start the Flask server
python app.py
```

The backend runs on `http://localhost:5000`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start the dev server
npm run dev
```

The frontend runs on `http://localhost:3000`

### 4. Open the App

Visit [http://localhost:3000](http://localhost:3000) in your browser.

You can either:
- Set `GROQ_API_KEY` in `backend/.env`, OR
- Enter your API key in the app via the **"Set API Key"** button

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/summarize` | POST | Upload PDF and generate summary |
| `/api/history` | GET | Fetch all past summaries |
| `/api/download/:id` | GET | Download summary as PDF |
| `/api/history/:id` | DELETE | Delete a history entry |

## Building for Production

```bash
# Build frontend
cd frontend && npm run build

# Serve with Flask (after build, Flask can serve the dist folder)
cd backend && python app.py
```
