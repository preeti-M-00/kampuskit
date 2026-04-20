from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
import json
import uuid
import io
from datetime import datetime
from pypdf import PdfReader
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

HISTORY_FILE = "history.json"

def load_history(user_id="default"):
    if os.path.exists(HISTORY_FILE):
        with open(HISTORY_FILE, "r") as f:
            all_history = json.load(f)
            if isinstance(all_history, list):
                # migrate old format
                return all_history if user_id == "default" else []
            return all_history.get(user_id, [])
    return []

def save_history(history, user_id="default"):
    all_history = {}
    if os.path.exists(HISTORY_FILE):
        with open(HISTORY_FILE, "r") as f:
            data = json.load(f)
            if isinstance(data, dict):
                all_history = data
    all_history[user_id] = history
    with open(HISTORY_FILE, "w") as f:
        json.dump(all_history, f, indent=2)

def extract_text_from_pdf(file_bytes):
    reader = PdfReader(io.BytesIO(file_bytes))
    text = ""
    for page in reader.pages:
        text += page.extract_text() + "\n"
    return text.strip()

def summarize_with_groq(text, length_type):
    api_key = os.getenv('GROQ_API_KEY', '')
    if not api_key:
        raise ValueError("GROQ_API_KEY is not set in the environment.")
    client = Groq(api_key=api_key)

    length_configs = {
        "short": {
            "instruction": "Create a SHORT summary (150-250 words). Focus only on the most critical points.",
            "max_tokens": 500
        },
        "medium": {
            "instruction": "Create a MEDIUM summary (400-600 words). Cover main points and key supporting details.",
            "max_tokens": 1000
        },
        "long": {
            "instruction": "Create a LONG detailed summary (800-1200 words). Cover all significant points thoroughly.",
            "max_tokens": 2000
        }
    }

    config = length_configs.get(length_type, length_configs["medium"])

    prompt = f"""You are an expert document summarizer. {config['instruction']}

Format the summary with these sections using markdown-style headings:
## Overview
(2-3 sentence high-level summary)

## Key Points
(bullet points of main ideas)

## Details
(expanded explanation of the most important content)

## Conclusion
(closing takeaway)

Document to summarize:
{text[:12000]}

Respond ONLY with the formatted summary. No preamble or meta-commentary."""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=config["max_tokens"],
        temperature=0.5
    )

    return response.choices[0].message.content

def create_summary_pdf(summary_text, filename, length_type):
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=inch,
        leftMargin=inch,
        topMargin=inch,
        bottomMargin=inch
    )

    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Title'],
        fontSize=20,
        spaceAfter=20,
        textColor=colors.HexColor('#2a1b5e'),
        fontName='Helvetica-Bold'
    )

    heading_style = ParagraphStyle(
        'CustomHeading',
        parent=styles['Heading2'],
        fontSize=14,
        spaceBefore=16,
        spaceAfter=8,
        textColor=colors.HexColor('#4a2f9e'),
        fontName='Helvetica-Bold'
    )

    body_style = ParagraphStyle(
        'CustomBody',
        parent=styles['Normal'],
        fontSize=11,
        spaceAfter=8,
        leading=16,
        fontName='Helvetica'
    )

    bullet_style = ParagraphStyle(
        'CustomBullet',
        parent=styles['Normal'],
        fontSize=11,
        spaceAfter=6,
        leading=16,
        leftIndent=20,
        fontName='Helvetica'
    )

    meta_style = ParagraphStyle(
        'Meta',
        parent=styles['Normal'],
        fontSize=9,
        textColor=colors.HexColor('#888888'),
        spaceAfter=20,
        fontName='Helvetica-Oblique'
    )

    story = []

    story.append(Paragraph(f"PDF Summary", title_style))
    story.append(Paragraph(
        f"File: {filename} | Type: {length_type.capitalize()} | Generated: {datetime.now().strftime('%B %d, %Y %I:%M %p')}",
        meta_style
    ))

    lines = summary_text.split('\n')
    for line in lines:
        line = line.strip()
        if not line:
            story.append(Spacer(1, 6))
            continue

        if line.startswith('## '):
            heading = line[3:].strip()
            story.append(Paragraph(heading, heading_style))
        elif line.startswith('# '):
            heading = line[2:].strip()
            story.append(Paragraph(heading, heading_style))
        elif line.startswith('- ') or line.startswith('* '):
            content = line[2:].strip()
            content = content.replace('**', '<b>').replace('**', '</b>')
            story.append(Paragraph(f"• {content}", bullet_style))
        elif line.startswith('**') and line.endswith('**'):
            content = line[2:-2]
            story.append(Paragraph(f"<b>{content}</b>", body_style))
        else:
            line = line.replace('**', '<b>', 1)
            line = line.replace('**', '</b>', 1)
            story.append(Paragraph(line, body_style))

    doc.build(story)
    buffer.seek(0)
    return buffer

@app.route('/api/summarize', methods=['POST'])
def summarize():
    try:
        user_id = request.form.get('userId', 'default')
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400

        file = request.files['file']
        length_type = request.form.get('length', 'medium')

        if not file.filename.endswith('.pdf'):
            return jsonify({'error': 'Only PDF files are supported'}), 400

        file_bytes = file.read()
        extracted_text = extract_text_from_pdf(file_bytes)

        if not extracted_text:
            return jsonify({'error': 'Could not extract text from PDF'}), 400

        summary = summarize_with_groq(extracted_text, length_type)

        entry_id = str(uuid.uuid4())
        history = load_history(user_id)
        entry = {
            "id": entry_id,
            "filename": file.filename,
            "length_type": length_type,
            "timestamp": datetime.now().isoformat(),
            "summary": summary,
            "word_count": len(summary.split())
        }
        history.insert(0, entry)
        history = history[:50]
        save_history(history, user_id)

        return jsonify({
            "success": True,
            "id": entry_id,
            "summary": summary,
            "filename": file.filename,
            "length_type": length_type
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/download/<entry_id>', methods=['GET'])
def download_pdf(entry_id):
    try:
        user_id = request.args.get('userId', 'default')
        history = load_history(user_id)
        entry = next((e for e in history if e['id'] == entry_id), None)

        if not entry:
            return jsonify({'error': 'Entry not found'}), 404

        pdf_buffer = create_summary_pdf(
            entry['summary'],
            entry['filename'],
            entry['length_type']
        )

        safe_name = entry['filename'].replace('.pdf', f'_summary_{entry["length_type"]}.pdf')
        return send_file(
            pdf_buffer,
            mimetype='application/pdf',
            as_attachment=True,
            download_name=safe_name
        )

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/history', methods=['GET'])
def get_history():
    user_id = request.args.get('userId', 'default')
    return jsonify(load_history(user_id))

@app.route('/api/history/<entry_id>', methods=['DELETE'])
def delete_entry(entry_id):
    user_id = request.args.get('userId', 'default')
    history = load_history(user_id)
    history = [e for e in history if e['id'] != entry_id]
    save_history(history, user_id)
    return jsonify({'success': True})

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok'})

if __name__ == '__main__':
    app.run(debug=True, port=5000)
