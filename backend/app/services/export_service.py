import os
import io
import json
import zipfile
from typing import Dict, Any
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
import docx
from backend.app.config import settings

class ExportService:
    """Generates real downloadable files: PPTX, PDF, DOCX, SRT, JSON, MD, and ZIP."""

    @staticmethod
    def generate_pptx(presentation_data: Dict[str, Any]) -> bytes:
        prs = Presentation()
        # Set 16:9 widescreen dimensions
        prs.slide_width = Inches(13.333)
        prs.slide_height = Inches(7.5)
        blank_slide_layout = prs.slide_layouts[6] # blank

        deck_title = presentation_data.get("deck_title", "SUNDAY Intelligence Briefing")
        deck_subtitle = presentation_data.get("deck_subtitle", "Automated Content Transformation")
        slides = presentation_data.get("slides", [])

        # 1. Title Slide
        slide = prs.slides.add_slide(blank_slide_layout)
        # Background shape
        bg = slide.shapes.add_shape(1, Inches(0), Inches(0), Inches(13.333), Inches(7.5)) # 1 = msoShapeRectangle
        bg.fill.solid()
        bg.fill.fore_color.rgb = RGBColor(15, 23, 42) # Slate-900
        bg.line.color.rgb = RGBColor(14, 165, 233) # Sky-500

        # Title Box
        tb = slide.shapes.add_textbox(Inches(1.0), Inches(2.2), Inches(11.333), Inches(2.5))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = deck_title.upper()
        p.font.size = Pt(36)
        p.font.bold = True
        p.font.color.rgb = RGBColor(56, 189, 248) # Cyan-400
        p.alignment = PP_ALIGN.CENTER

        p2 = tf.add_paragraph()
        p2.text = deck_subtitle
        p2.font.size = Pt(20)
        p2.font.color.rgb = RGBColor(226, 232, 240) # Slate-200
        p2.alignment = PP_ALIGN.CENTER

        p3 = tf.add_paragraph()
        p3.text = "\nNATIONAL TECHNICAL RESEARCH ORGANISATION (SUNDAY)"
        p3.font.size = Pt(14)
        p3.font.bold = True
        p3.font.color.rgb = RGBColor(239, 68, 68) # Red-500
        p3.alignment = PP_ALIGN.CENTER

        # 2. Content Slides
        for s in slides:
            slide = prs.slides.add_slide(blank_slide_layout)
            # Dark card background
            bg = slide.shapes.add_shape(1, Inches(0), Inches(0), Inches(13.333), Inches(7.5))
            bg.fill.solid()
            bg.fill.fore_color.rgb = RGBColor(15, 23, 42)
            bg.line.fill.background()

            # Header Banner
            header = slide.shapes.add_shape(1, Inches(0), Inches(0), Inches(13.333), Inches(1.2))
            header.fill.solid()
            header.fill.fore_color.rgb = RGBColor(30, 41, 59)
            header.line.fill.background()

            # Slide Title
            tb_h = slide.shapes.add_textbox(Inches(0.8), Inches(0.25), Inches(11.5), Inches(0.8))
            tf_h = tb_h.text_frame
            p_h = tf_h.paragraphs[0]
            p_h.text = f"{s.get('slide_number', '')}. {s.get('title', 'Slide')}"
            p_h.font.size = Pt(24)
            p_h.font.bold = True
            p_h.font.color.rgb = RGBColor(56, 189, 248)

            # Slide Content Box
            tb_c = slide.shapes.add_textbox(Inches(0.8), Inches(1.6), Inches(11.5), Inches(5.0))
            tf_c = tb_c.text_frame
            tf_c.word_wrap = True

            bullets = s.get("bullet_points", [])
            for i, b in enumerate(bullets):
                p_b = tf_c.paragraphs[0] if i == 0 else tf_c.add_paragraph()
                p_b.text = f"• {b}"
                p_b.font.size = Pt(18)
                p_b.font.color.rgb = RGBColor(241, 245, 249)
                p_b.space_after = Pt(14)

            # Speaker Notes
            notes_slide = slide.notes_slide
            text_frame = notes_slide.notes_text_frame
            text_frame.text = s.get("speaker_notes", "")

        out = io.BytesIO()
        prs.save(out)
        out.seek(0)
        return out.getvalue()

    @staticmethod
    def generate_pdf(artefacts: Dict[str, Any], meta: Dict[str, Any] = None) -> bytes:
        meta = meta or {}
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=letter,
            rightMargin=36,
            leftMargin=36,
            topMargin=36,
            bottomMargin=36
        )
        styles = getSampleStyleSheet()

        title_style = ParagraphStyle(
            'DocTitle',
            parent=styles['Heading1'],
            fontSize=18,
            leading=22,
            textColor=colors.HexColor("#0f172a"),
            fontName="Helvetica-Bold",
            spaceAfter=10
        )
        heading_style = ParagraphStyle(
            'SectionHeading',
            parent=styles['Heading2'],
            fontSize=13,
            leading=16,
            textColor=colors.HexColor("#0284c7"),
            fontName="Helvetica-Bold",
            spaceBefore=14,
            spaceAfter=6
        )
        body_style = ParagraphStyle(
            'DocBody',
            parent=styles['Normal'],
            fontSize=9.5,
            leading=13.5,
            textColor=colors.HexColor("#1e293b"),
            spaceAfter=6
        )
        meta_style = ParagraphStyle(
            'MetaText',
            parent=styles['Normal'],
            fontSize=8,
            leading=11,
            textColor=colors.HexColor("#64748b")
        )

        elements = []

        # SUNDAY Header
        elements.append(Paragraph("<b>NATIONAL TECHNICAL RESEARCH ORGANISATION (SUNDAY)</b>", title_style))
        elements.append(Paragraph(f"<b>GEN AI AUTOMATED CONTENT TRANSFORMATION DOSSIER</b> | Sunday", meta_style))
        classification = meta.get("security_classification", "RESTRICTED")
        elements.append(Paragraph(f"<b>CLASSIFICATION:</b> <font color='red'><b>{classification}</b></font> | <b>DATE:</b> 2026-08-22", meta_style))
        elements.append(Spacer(1, 12))

        for k, v in artefacts.items():
            elements.append(Paragraph(f"<b>ARTEFACT: {k.upper().replace('_', ' ')}</b>", heading_style))
            if isinstance(v, dict):
                if "title" in v:
                    elements.append(Paragraph(f"<b>Title:</b> {v['title']}", body_style))
                if "bluf" in v:
                    elements.append(Paragraph(f"<b>BLUF:</b> {v['bluf']}", body_style))
                if "executive_summary" in v:
                    elements.append(Paragraph(f"<b>Executive Summary:</b> {v['executive_summary']}", body_style))
                if "full_text" in v:
                    elements.append(Paragraph(v["full_text"].replace("\n", "<br/>"), body_style))
                if "mitigation_steps" in v and isinstance(v["mitigation_steps"], list):
                    elements.append(Paragraph("<b>Mitigation Steps:</b>", body_style))
                    for m in v["mitigation_steps"]:
                        elements.append(Paragraph(f"• {m}", body_style))
                if "key_findings" in v and isinstance(v["key_findings"], list):
                    elements.append(Paragraph("<b>Key Findings:</b>", body_style))
                    for f in v["key_findings"]:
                        elements.append(Paragraph(f"• {f}", body_style))
            elif isinstance(v, str):
                elements.append(Paragraph(v.replace("\n", "<br/>"), body_style))
            elements.append(Spacer(1, 10))

        doc.build(elements)
        buffer.seek(0)
        return buffer.getvalue()

    @staticmethod
    def generate_docx(artefacts: Dict[str, Any], meta: Dict[str, Any] = None) -> bytes:
        doc = docx.Document()
        doc.add_heading("the Organisation", 0)
        doc.add_paragraph("Gen AI Automated Content Transformation Deliverable Dossier")
        doc.add_paragraph(f"Security Classification: {meta.get('security_classification', 'RESTRICTED') if meta else 'RESTRICTED'}")
        doc.add_paragraph("------------------------------------------------------------")

        for k, v in artefacts.items():
            doc.add_heading(f"Artefact: {k.replace('_', ' ').title()}", level=1)
            if isinstance(v, dict):
                for sub_k, sub_v in v.items():
                    if isinstance(sub_v, str):
                        doc.add_paragraph(f"{sub_k.title()}:\n{sub_v}")
                    elif isinstance(sub_v, list):
                        doc.add_paragraph(f"{sub_k.title()}:")
                        for item in sub_v:
                            doc.add_paragraph(f" - {str(item)}")
            else:
                doc.add_paragraph(str(v))
            doc.add_paragraph("")

        out = io.BytesIO()
        doc.save(out)
        out.seek(0)
        return out.getvalue()

    @staticmethod
    def generate_zip_bundle(
        artefacts: Dict[str, Any],
        source_title: str,
        meta: Dict[str, Any] = None
    ) -> bytes:
        meta = meta or {}
        zip_buffer = io.BytesIO()
        with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zf:
            # 1. Full JSON Package
            zf.writestr("sunday_all_artefacts.json", json.dumps(artefacts, indent=2))

            # 2. Markdown Dossier
            md_content = f"# SUNDAY Transformation Dossier: {source_title}\n\n"
            md_content += f"**Classification:** {meta.get('security_classification', 'RESTRICTED')}\n\n"
            for k, v in artefacts.items():
                md_content += f"## Artefact: {k.upper()}\n\n```json\n{json.dumps(v, indent=2)}\n```\n\n"
            zf.writestr("sunday_dossier.md", md_content)

            # 3. If presentation exists, add PPTX
            if "presentation" in artefacts and isinstance(artefacts["presentation"], dict):
                try:
                    pptx_bytes = ExportService.generate_pptx(artefacts["presentation"])
                    zf.writestr("presentation_deck.pptx", pptx_bytes)
                except Exception:
                    pass

            # 4. If video package exists, add SRT
            if "video_package" in artefacts and isinstance(artefacts["video_package"], dict):
                srt = artefacts["video_package"].get("subtitles_srt", "")
                if srt:
                    zf.writestr("video_subtitles.srt", srt)

            # 5. Compiled PDF
            try:
                pdf_bytes = ExportService.generate_pdf(artefacts, meta)
                zf.writestr("sunday_briefing_dossier.pdf", pdf_bytes)
            except Exception:
                pass

            # 6. Compiled DOCX
            try:
                docx_bytes = ExportService.generate_docx(artefacts, meta)
                zf.writestr("sunday_briefing_dossier.docx", docx_bytes)
            except Exception:
                pass

        zip_buffer.seek(0)
        return zip_buffer.getvalue()

export_service = ExportService()
