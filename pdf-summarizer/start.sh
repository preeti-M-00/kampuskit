#!/bin/bash

echo "🚀 Starting PDF Summarizer AI..."
echo ""

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 not found. Please install Python 3.8+"
    exit 1
fi

# Check Node
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 16+"
    exit 1
fi

# Install backend deps
echo "📦 Installing backend dependencies..."
cd backend
pip install -r requirements.txt -q
cd ..

# Install frontend deps
echo "📦 Installing frontend dependencies..."
cd frontend
npm install --silent
cd ..

echo ""
echo "✅ Dependencies installed!"
echo ""
echo "Starting servers..."
echo "  Backend: http://localhost:5000"
echo "  Frontend: http://localhost:3000"
echo ""

# Start backend in background
cd backend && python app.py &
BACKEND_PID=$!

# Start frontend
cd ../frontend && npm run dev

# Cleanup on exit
kill $BACKEND_PID 2>/dev/null
