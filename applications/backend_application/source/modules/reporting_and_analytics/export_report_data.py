"""Export report data to CSV and PDF formats.

CSV: Standard comma-separated values via Python csv module.
PDF: Table-formatted using reportlab.
"""

import csv
import io
from typing import Any

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle


def export_rows_to_csv(
    headers: list[str],
    rows: list[list[Any]],
) -> str:
    """Convert tabular data to a CSV string."""
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(headers)
    writer.writerows(rows)
    return output.getvalue()


def export_rows_to_pdf(
    title: str,
    headers: list[str],
    rows: list[list[Any]],
    summary_lines: list[str] | None = None,
) -> bytes:
    """Generate a PDF containing a table with the given headers and rows.

    Args:
        title: Report title displayed at the top.
        headers: Column header labels.
        rows: Data rows — each row is a list of values.
        summary_lines: Optional lines displayed below the table (grand totals).

    Returns:
        PDF file content as bytes.
    """
    buffer = io.BytesIO()
    document = SimpleDocTemplate(
        buffer,
        pagesize=landscape(A4),
        leftMargin=15 * mm,
        rightMargin=15 * mm,
        topMargin=15 * mm,
        bottomMargin=15 * mm,
    )

    styles = getSampleStyleSheet()
    elements = []

    # Title
    title_style = styles["Heading1"]
    title_style.alignment = 0
    elements.append(Paragraph(title, title_style))
    elements.append(Spacer(1, 8 * mm))

    # Build table data
    table_data = [headers] + rows

    table = Table(table_data, repeatRows=1)
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#C13B2E")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, 0), 9),
        ("FONTSIZE", (0, 1), (-1, -1), 8),
        ("ALIGN", (0, 0), (-1, -1), "LEFT"),
        ("BOTTOMPADDING", (0, 0), (-1, 0), 6),
        ("TOPPADDING", (0, 0), (-1, 0), 6),
        ("BOTTOMPADDING", (0, 1), (-1, -1), 4),
        ("TOPPADDING", (0, 1), (-1, -1), 4),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#D3D3CC")),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#FAFAF8")]),
    ]))
    elements.append(table)

    # Summary lines
    if summary_lines:
        elements.append(Spacer(1, 6 * mm))
        summary_style = styles["Normal"]
        for line in summary_lines:
            elements.append(Paragraph(f"<b>{line}</b>", summary_style))

    document.build(elements)
    return buffer.getvalue()
