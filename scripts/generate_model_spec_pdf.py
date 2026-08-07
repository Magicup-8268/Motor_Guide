import io
import json
import sys
from pathlib import Path

from reportlab.lib.colors import HexColor
from reportlab.lib.pagesizes import A4
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas


ROOT = Path(__file__).resolve().parents[1]
FONT_DIR = ROOT / 'src' / 'assets' / 'fonts'
REGULAR_FONT = 'NanumGothic'
BOLD_FONT = 'NanumGothicBold'

NAVY = HexColor('#08111e')
INK = HexColor('#15283d')
MUTED = HexColor('#587089')
SKY = HexColor('#329ff1')
SKY_LIGHT = HexColor('#dff2ff')
GOLD = HexColor('#d89724')
LINE = HexColor('#dbe7f1')
SURFACE = HexColor('#f7fafc')
WHITE = HexColor('#ffffff')


def register_fonts():
    pdfmetrics.registerFont(TTFont(REGULAR_FONT, str(FONT_DIR / 'NanumGothic.ttf')))
    pdfmetrics.registerFont(TTFont(BOLD_FONT, str(FONT_DIR / 'NanumGothicBold.ttf')))


def wrap_text(text, font_name, font_size, max_width, max_lines=None):
    text = str(text or '')
    if not text:
        return []
    lines = []
    current = ''
    for char in text:
        candidate = current + char
        if current and pdfmetrics.stringWidth(candidate, font_name, font_size) > max_width:
            break_at = current.rfind(' ')
            if break_at > 0:
                lines.append(current[:break_at].rstrip())
                current = current[break_at + 1:].lstrip() + char
            else:
                lines.append(current)
                current = char
        else:
            current = candidate
    if current:
        lines.append(current)

    if max_lines and len(lines) > max_lines:
        lines = lines[:max_lines]
        ellipsis = '...'
        while lines[-1] and pdfmetrics.stringWidth(lines[-1] + ellipsis, font_name, font_size) > max_width:
            lines[-1] = lines[-1][:-1]
        lines[-1] += ellipsis
    return lines


def draw_wrapped(pdf, text, x, y, width, font_name, font_size, color, line_height, max_lines=None):
    pdf.setFillColor(color)
    pdf.setFont(font_name, font_size)
    lines = wrap_text(text, font_name, font_size, width, max_lines)
    for index, line in enumerate(lines):
        pdf.drawString(x, y - (index * line_height), line)
    return y - (len(lines) * line_height)


def draw_round_rect(pdf, x, y, width, height, fill, stroke=None, radius=10):
    pdf.setFillColor(fill)
    pdf.setStrokeColor(stroke or fill)
    pdf.roundRect(x, y, width, height, radius, fill=1, stroke=bool(stroke))


def draw_spec_column(pdf, rows, x, y, width):
    row_height = 57
    for label, value in rows:
        pdf.setStrokeColor(LINE)
        pdf.line(x, y, x + width, y)
        pdf.setFillColor(MUTED)
        pdf.setFont(REGULAR_FONT, 8)
        pdf.drawString(x, y - 13, label)
        pdf.setFillColor(INK)
        pdf.setFont(BOLD_FONT, 9)
        values = wrap_text(value, BOLD_FONT, 9, width - 92, 3)
        for index, line in enumerate(values):
            line_width = pdfmetrics.stringWidth(line, BOLD_FONT, 9)
            pdf.drawString(x + width - line_width, y - 13 - (index * 11), line)
        y -= row_height
    pdf.setStrokeColor(LINE)
    pdf.line(x, y, x + width, y)


def create_pdf(payload):
    register_fonts()
    buffer = io.BytesIO()
    pdf = canvas.Canvas(buffer, pagesize=A4, pageCompression=1)
    page_width, page_height = A4
    margin = 42
    content_width = page_width - (margin * 2)

    pdf.setTitle(f"{payload['model']} - Kinco Spec Card")
    pdf.setAuthor('Magicup-Work-Flow')
    pdf.setSubject('Kinco motor official specification summary')

    pdf.setFillColor(SURFACE)
    pdf.rect(0, 0, page_width, page_height, fill=1, stroke=0)
    pdf.setFillColor(NAVY)
    pdf.rect(0, page_height - 216, page_width, 216, fill=1, stroke=0)

    draw_round_rect(pdf, margin, page_height - 58, 116, 22, HexColor('#173556'), radius=8)
    pdf.setFillColor(SKY_LIGHT)
    pdf.setFont(BOLD_FONT, 8)
    pdf.drawCentredString(margin + 58, page_height - 50, 'MAGICUP-WORK-FLOW')

    pdf.setFillColor(GOLD)
    pdf.setFont(BOLD_FONT, 8)
    pdf.drawString(margin, page_height - 84, 'KINCO MOTOR SPEC CARD')
    pdf.setFillColor(WHITE)
    pdf.setFont(BOLD_FONT, 20)
    model_lines = wrap_text(payload['model'], BOLD_FONT, 20, content_width, 2)
    for index, line in enumerate(model_lines):
        pdf.drawString(margin, page_height - 112 - (index * 25), line)

    model_end = page_height - 112 - (len(model_lines) * 25)
    pdf.setFillColor(SKY_LIGHT)
    pdf.setFont(REGULAR_FONT, 10)
    pdf.drawString(margin, model_end - 2, f"{payload['category']}  |  KINCO - {payload['series']}")
    draw_wrapped(pdf, payload['summary'], margin, model_end - 24, content_width, REGULAR_FONT, 9, HexColor('#c7d8e7'), 13, 2)

    body_top = page_height - 244
    pdf.setFillColor(INK)
    pdf.setFont(BOLD_FONT, 13)
    pdf.drawString(margin, body_top, '핵심 사양')
    pdf.setFillColor(MUTED)
    pdf.setFont(REGULAR_FONT, 8)
    pdf.drawRightString(page_width - margin, body_top, f"공식 확인일: {payload['source_checked']} (KST)")

    specifications = payload.get('specifications', [])[:12]
    midpoint = (len(specifications) + 1) // 2
    column_gap = 22
    column_width = (content_width - column_gap) / 2
    draw_spec_column(pdf, specifications[:midpoint], margin, body_top - 16, column_width)
    draw_spec_column(pdf, specifications[midpoint:], margin + column_width + column_gap, body_top - 16, column_width)

    feature_y = 150
    draw_round_rect(pdf, margin, feature_y, content_width, 78, WHITE, LINE, radius=12)
    pdf.setFillColor(SKY)
    pdf.setFont(BOLD_FONT, 9)
    pdf.drawString(margin + 14, feature_y + 58, '핵심 특징')
    features = payload.get('features', [])[:3]
    feature_text = '  |  '.join(features) if features else '공식 제품 페이지에서 공개된 핵심 특징을 확인하세요.'
    draw_wrapped(pdf, feature_text, margin + 14, feature_y + 39, content_width - 28, REGULAR_FONT, 9, INK, 13, 2)

    footer_y = 68
    pdf.setStrokeColor(LINE)
    pdf.line(margin, footer_y + 75, page_width - margin, footer_y + 75)
    pdf.setFillColor(MUTED)
    pdf.setFont(BOLD_FONT, 8)
    pdf.drawString(margin, footer_y + 56, '공식 제품 페이지')
    draw_wrapped(pdf, payload['official_url'], margin, footer_y + 42, content_width, REGULAR_FONT, 7.5, INK, 10, 2)
    pdf.setFillColor(MUTED)
    pdf.setFont(BOLD_FONT, 8)
    pdf.drawString(margin, footer_y + 13, '상세 사양 링크')
    draw_wrapped(pdf, payload['share_url'], margin, footer_y - 1, content_width, REGULAR_FONT, 7.5, INK, 10, 2)

    pdf.setFillColor(MUTED)
    pdf.setFont(REGULAR_FONT, 7.5)
    pdf.drawString(margin, 28, '본 PDF는 Kinco 공개 사양을 기준으로 생성되었습니다. 미공개 항목은 추정하지 않습니다.')
    pdf.drawRightString(page_width - margin, 28, 'Magicup-Work-Flow')
    pdf.showPage()
    pdf.save()
    return buffer.getvalue()


def main():
    payload = json.loads(sys.stdin.buffer.read().decode('utf-8'))
    sys.stdout.buffer.write(create_pdf(payload))


if __name__ == '__main__':
    main()
