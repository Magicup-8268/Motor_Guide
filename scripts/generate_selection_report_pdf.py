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
GOLD_LIGHT = HexColor('#f6c65b')
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
        suffix = '...'
        while lines[-1] and pdfmetrics.stringWidth(lines[-1] + suffix, font_name, font_size) > max_width:
            lines[-1] = lines[-1][:-1]
        lines[-1] += suffix
    return lines


def draw_wrapped(pdf, text, x, y, width, font_name, font_size, color, line_height, max_lines=None):
    pdf.setFillColor(color)
    pdf.setFont(font_name, font_size)
    lines = wrap_text(text, font_name, font_size, width, max_lines)
    for index, line in enumerate(lines):
        pdf.drawString(x, y - (index * line_height), line)
    return y - (len(lines) * line_height)


def round_rect(pdf, x, y, width, height, fill, stroke=None, radius=9):
    pdf.setFillColor(fill)
    pdf.setStrokeColor(stroke or fill)
    pdf.roundRect(x, y, width, height, radius, fill=1, stroke=bool(stroke))


def draw_header(pdf, page_width, page_height, margin, title, generated_at, page_number):
    pdf.setFillColor(SURFACE)
    pdf.rect(0, 0, page_width, page_height, fill=1, stroke=0)
    pdf.setFillColor(NAVY)
    pdf.rect(0, page_height - 126, page_width, 126, fill=1, stroke=0)
    round_rect(pdf, margin, page_height - 42, 121, 21, HexColor('#173556'), radius=7)
    pdf.setFillColor(SKY_LIGHT)
    pdf.setFont(BOLD_FONT, 7.5)
    pdf.drawCentredString(margin + 60.5, page_height - 35, 'MAGICUP-WORK-FLOW')
    pdf.setFillColor(GOLD_LIGHT)
    pdf.setFont(BOLD_FONT, 8)
    pdf.drawString(margin, page_height - 62, 'MOTOR SELECTION REPORT')
    pdf.setFillColor(WHITE)
    pdf.setFont(BOLD_FONT, 17)
    title_lines = wrap_text(title, BOLD_FONT, 17, page_width - (margin * 2), 2)
    for index, line in enumerate(title_lines):
        pdf.drawString(margin, page_height - 88 - (index * 21), line)
    pdf.setFillColor(SKY_LIGHT)
    pdf.setFont(REGULAR_FONT, 7.5)
    pdf.drawRightString(page_width - margin, page_height - 38, generated_at)
    pdf.drawRightString(page_width - margin, page_height - 112, f'PAGE {page_number} / 2')


def draw_footer(pdf, page_width, margin, source_note):
    pdf.setStrokeColor(LINE)
    pdf.line(margin, 45, page_width - margin, 45)
    draw_wrapped(pdf, source_note, margin, 31, page_width - (margin * 2) - 88, REGULAR_FONT, 6.8, MUTED, 8, 2)
    pdf.setFillColor(MUTED)
    pdf.setFont(REGULAR_FONT, 6.8)
    pdf.drawRightString(page_width - margin, 25, 'Magicup-Work-Flow')


def draw_section_title(pdf, title, x, y):
    pdf.setFillColor(SKY)
    pdf.rect(x, y - 3, 18, 3, fill=1, stroke=0)
    pdf.setFillColor(INK)
    pdf.setFont(BOLD_FONT, 11)
    pdf.drawString(x + 25, y - 6, title)
    return y - 24


def draw_value_cards(pdf, items, x, top, width, columns=2):
    gap = 8
    card_width = (width - (gap * (columns - 1))) / columns
    card_height = 43
    for index, item in enumerate(items):
        row = index // columns
        column = index % columns
        card_x = x + (column * (card_width + gap))
        card_y = top - (row * (card_height + gap)) - card_height
        round_rect(pdf, card_x, card_y, card_width, card_height, WHITE, LINE, radius=8)
        pdf.setFillColor(MUTED)
        pdf.setFont(BOLD_FONT, 7.5)
        pdf.drawString(card_x + 10, card_y + 29, item['label'])
        draw_wrapped(pdf, item['value'], card_x + 10, card_y + 15, card_width - 20, BOLD_FONT, 8.5, INK, 10, 1)
    rows = (len(items) + columns - 1) // columns
    return top - (rows * (card_height + gap))


def draw_recommendations(pdf, recommendations, x, top, width):
    if not recommendations:
        round_rect(pdf, x, top - 56, width, 56, WHITE, LINE, radius=9)
        pdf.setFillColor(MUTED)
        pdf.setFont(REGULAR_FONT, 8.5)
        pdf.drawString(x + 14, top - 24, '현재 선정 조건과 일치하는 등록 모델을 찾지 못했습니다.')
        return top - 66
    y = top
    for item in recommendations[:3]:
        card_height = 62
        round_rect(pdf, x, y - card_height, width, card_height, WHITE, LINE, radius=9)
        round_rect(pdf, x + 11, y - 24, 34, 15, HexColor('#e7f5ff'), radius=6)
        pdf.setFillColor(SKY)
        pdf.setFont(BOLD_FONT, 7)
        pdf.drawCentredString(x + 28, y - 19, f"TOP {item['rank']}")
        pdf.setFillColor(INK)
        pdf.setFont(BOLD_FONT, 10)
        pdf.drawString(x + 54, y - 18, item['model'])
        pdf.setFillColor(MUTED)
        pdf.setFont(REGULAR_FONT, 7.5)
        pdf.drawString(x + 54, y - 31, f"{item['category']} | {item['series']} | {item['power']}")
        draw_wrapped(pdf, item['features'], x + 54, y - 44, width - 66, REGULAR_FONT, 7.2, INK, 9, 1)
        pdf.setFillColor(SKY)
        pdf.setFont(REGULAR_FONT, 6.8)
        protocol_width = pdfmetrics.stringWidth(item['protocols'], REGULAR_FONT, 6.8)
        if protocol_width <= width - 66:
            pdf.drawRightString(x + width - 11, y - 18, item['protocols'])
        y -= card_height + 8
    return y


def draw_comparison_table(pdf, rows, product_names, x, top, width):
    if not product_names:
        round_rect(pdf, x, top - 56, width, 56, WHITE, LINE, radius=9)
        pdf.setFillColor(MUTED)
        pdf.setFont(REGULAR_FONT, 8.5)
        pdf.drawString(x + 14, top - 24, '비교 대상이 없습니다. 선정 조건을 적용한 뒤 보고서를 다시 생성하세요.')
        return top - 66
    label_width = 86
    value_width = (width - label_width) / len(product_names)
    header_height = 38
    pdf.setFillColor(INK)
    pdf.rect(x, top - header_height, width, header_height, fill=1, stroke=0)
    pdf.setFillColor(SKY_LIGHT)
    pdf.setFont(BOLD_FONT, 7.5)
    pdf.drawString(x + 9, top - 22, '항목')
    for index, name in enumerate(product_names):
        lines = wrap_text(name, BOLD_FONT, 7.5, value_width - 10, 2)
        for line_index, line in enumerate(lines):
            pdf.drawCentredString(x + label_width + (index * value_width) + (value_width / 2), top - 16 - (line_index * 9), line)
    y = top - header_height
    for row in rows:
        wrapped_values = [wrap_text(value, REGULAR_FONT, 7.2, value_width - 10, 2) for value in row['values']]
        line_count = max([len(lines) for lines in wrapped_values] + [1])
        row_height = max(31, 13 + (line_count * 9))
        pdf.setFillColor(WHITE)
        pdf.setStrokeColor(LINE)
        pdf.rect(x, y - row_height, width, row_height, fill=1, stroke=1)
        pdf.setFillColor(MUTED)
        pdf.setFont(BOLD_FONT, 7.2)
        pdf.drawString(x + 9, y - 18, row['label'])
        for index, lines in enumerate(wrapped_values):
            value_x = x + label_width + (index * value_width) + 5
            pdf.setFillColor(INK)
            pdf.setFont(REGULAR_FONT, 7.2)
            for line_index, line in enumerate(lines):
                pdf.drawString(value_x, y - 15 - (line_index * 9), line)
        y -= row_height
    return y


def create_pdf(payload):
    register_fonts()
    buffer = io.BytesIO()
    pdf = canvas.Canvas(buffer, pagesize=A4, pageCompression=1)
    page_width, page_height = A4
    margin = 38
    content_width = page_width - (margin * 2)
    pdf.setTitle(f"{payload['title']} - Motor Selection Report")
    pdf.setAuthor('Magicup-Work-Flow')
    pdf.setSubject('Motor selection report')

    draw_header(pdf, page_width, page_height, margin, payload['title'], payload['generated_at'], 1)
    y = page_height - 154
    y = draw_section_title(pdf, '선정 조건', margin, y)
    condition_items = [{'label': f'조건 {index + 1}', 'value': condition} for index, condition in enumerate(payload.get('conditions', []))]
    y = draw_value_cards(pdf, condition_items, margin, y, content_width, 2) - 13

    y = draw_section_title(pdf, '추천 후보 Top 3', margin, y)
    draw_recommendations(pdf, payload.get('recommendations', []), margin, y, content_width)
    draw_footer(pdf, page_width, margin, payload['source_note'])
    pdf.showPage()

    draw_header(pdf, page_width, page_height, margin, payload['title'], payload['generated_at'], 2)
    y = page_height - 154
    y = draw_section_title(pdf, payload.get('comparison_label', '비교 대상'), margin, y)
    comparison_rows = payload.get('comparison_rows', [])
    product_names = payload.get('comparison_products', [])
    y = draw_comparison_table(pdf, comparison_rows, product_names, margin, y, content_width) - 22

    y = draw_section_title(pdf, '프로젝트 메모', margin, y)
    memo_height = max(78, min(142, y - 72))
    round_rect(pdf, margin, y - memo_height, content_width, memo_height, WHITE, LINE, radius=9)
    draw_wrapped(pdf, payload.get('note', ''), margin + 14, y - 18, content_width - 28, REGULAR_FONT, 8.5, INK, 13, 7)
    draw_footer(pdf, page_width, margin, payload['source_note'])
    pdf.showPage()
    pdf.save()
    return buffer.getvalue()


def main():
    payload = json.loads(sys.stdin.buffer.read().decode('utf-8'))
    sys.stdout.buffer.write(create_pdf(payload))


if __name__ == '__main__':
    main()
