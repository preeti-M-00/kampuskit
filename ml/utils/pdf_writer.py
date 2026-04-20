"""
pdf_writer.py — Build a nicely formatted summary PDF with ReportLab.
"""
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.lib import colors


def create_summary_pdf(sections: list, output_path: str):
    """
    sections: [{"heading": str, "text": str}, ...]
    """
    doc = SimpleDocTemplate(
        output_path,
        leftMargin=2.5 * cm,
        rightMargin=2.5 * cm,
        topMargin=2.5 * cm,
        bottomMargin=2.5 * cm,
    )

    styles   = getSampleStyleSheet()
    CHARCOAL = colors.HexColor("#1a1a2e")
    ACCENT   = colors.HexColor("#e8a838")

    title_style = ParagraphStyle(
        "DocTitle",
        parent=styles["Title"],
        fontSize=22,
        textColor=CHARCOAL,
        spaceAfter=6,
        fontName="Helvetica-Bold",
    )
    heading_style = ParagraphStyle(
        "SectionHeading",
        parent=styles["Heading2"],
        fontSize=13,
        textColor=ACCENT,
        spaceBefore=18,
        spaceAfter=6,
        fontName="Helvetica-Bold",
        borderPad=(0, 0, 4, 0),
    )
    body_style = ParagraphStyle(
        "BodyText",
        parent=styles["Normal"],
        fontSize=10.5,
        leading=16,
        textColor=CHARCOAL,
        spaceAfter=8,
    )

    story = [
        Paragraph("Document Summary", title_style),
        Spacer(1, 0.3 * cm),
    ]

    for section in sections:
        if section.get("heading") and section["heading"] != "Summary":
            story.append(Paragraph(section["heading"], heading_style))
        story.append(Paragraph(section["text"], body_style))
        story.append(Spacer(1, 0.2 * cm))

    doc.build(story)
