import os
from flask import Flask
from flask_cors import CORS
from utils.summarizer import load_model

# ── App Setup ────────────────────────────────────────────
app = Flask(__name__)
CORS(app)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
app.config["UPLOAD_DIR"] = os.path.join(BASE_DIR, "uploads")
app.config["OUTPUT_DIR"] = os.path.join(BASE_DIR, "outputs")

os.makedirs(app.config["UPLOAD_DIR"], exist_ok=True)
os.makedirs(app.config["OUTPUT_DIR"], exist_ok=True)

# ── Load model once at startup ───────────────────────────
print("⏳ Loading BART model...")
load_model()
print("✅ Model ready")

# ── Register routes ──────────────────────────────────────
from routes.summarize import summarize_bp  # noqa: E402
app.register_blueprint(summarize_bp)

if __name__ == "__main__":
    app.run(port=5001, debug=False)
