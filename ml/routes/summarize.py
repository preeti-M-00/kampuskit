import os
import uuid
from flask import Blueprint, request, send_file, jsonify, current_app
from utils.extractor import extract_text_from_pdf
from utils.summarizer import summarize_text
from utils.pdf_writer import create_summary_pdf

summarize_bp = Blueprint("summarize", __name__)


@summarize_bp.route("/summarize-pdf", methods=["POST"])
def summarize_pdf():
    if "pdf" not in request.files:
        return jsonify({"error": "No PDF file uploaded"}), 400

    pdf_file = request.files["pdf"]
    length   = request.form.get("length", "medium")   # short | medium | long

    uid        = str(uuid.uuid4())
    input_path = os.path.join(current_app.config["UPLOAD_DIR"], f"{uid}.pdf")
    output_path= os.path.join(current_app.config["OUTPUT_DIR"], f"{uid}_summary.pdf")

    pdf_file.save(input_path)

    # Extract
    pages, headings = extract_text_from_pdf(input_path)
    full_text = "\n\n".join(pages)
    if not full_text.strip():
        return jsonify({"error": "Could not extract text from PDF"}), 400

    # Summarize
    summary_sections = summarize_text(full_text, headings, length)

    # Build PDF
    create_summary_pdf(summary_sections, output_path)

    if not os.path.exists(output_path):
        return jsonify({"error": "Summary PDF was not created"}), 500

    # Return both the PDF file AND the plain-text summary as a header
    import json, base64
    plain_summary = "\n\n".join(
        f"{s['heading']}\n{s['text']}" for s in summary_sections
    )
    encoded = base64.b64encode(plain_summary.encode()).decode()

    return send_file(
        output_path,
        as_attachment=True,
        download_name="summary.pdf",
        mimetype="application/pdf",
    ), 200, {"X-Summary-Text": encoded}
