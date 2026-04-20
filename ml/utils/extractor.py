"""
extractor.py — Extract text and detect headings from a PDF.
Uses PyPDF2 for text; heuristic heading detection based on line length + casing.
"""
import re
from PyPDF2 import PdfReader


def _is_heading(line: str) -> bool:
    """Heuristic: short, title-cased or ALL-CAPS lines are likely headings."""
    stripped = line.strip()
    if not stripped or len(stripped) > 80:
        return False
    if stripped.isupper() and len(stripped) > 3:
        return True
    words = stripped.split()
    if len(words) <= 8 and stripped.istitle():
        return True
    return False


def extract_text_from_pdf(pdf_path: str):
    """
    Returns:
        pages    (list[str])  — text per page
        headings (list[str])  — detected headings in order
    """
    reader   = PdfReader(pdf_path)
    pages    = []
    headings = []

    for page in reader.pages:
        raw = page.extract_text() or ""
        pages.append(raw)

        for line in raw.splitlines():
            line = line.strip()
            if _is_heading(line) and line not in headings:
                headings.append(line)

    return pages, headings
