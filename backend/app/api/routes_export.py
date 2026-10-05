from fastapi import APIRouter, HTTPException, Response
from backend.app.models.request_models import ExportRequest
from backend.app.services.export_service import export_service

router = APIRouter(prefix="/export", tags=["Export"])

@router.post("/pptx")
async def export_presentation_pptx(req: ExportRequest):
    try:
        presentation_data = req.artefacts.get("presentation", req.artefacts)
        pptx_bytes = export_service.generate_pptx(presentation_data)
        return Response(
            content=pptx_bytes,
            media_type="application/vnd.openxmlformats-officedocument.presentationml.presentation",
            headers={"Content-Disposition": "attachment; filename=sunday_presentation_deck.pptx"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PPTX export failed: {str(e)}")

@router.post("/pdf")
async def export_document_pdf(req: ExportRequest):
    try:
        pdf_bytes = export_service.generate_pdf(req.artefacts, req.meta)
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={"Content-Disposition": "attachment; filename=sunday_briefing_dossier.pdf"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF export failed: {str(e)}")

@router.post("/docx")
async def export_document_docx(req: ExportRequest):
    try:
        docx_bytes = export_service.generate_docx(req.artefacts, req.meta)
        return Response(
            content=docx_bytes,
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            headers={"Content-Disposition": "attachment; filename=sunday_briefing_dossier.docx"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"DOCX export failed: {str(e)}")

@router.post("/srt")
async def export_video_subtitles(req: ExportRequest):
    try:
        video_data = req.artefacts.get("video_package", req.artefacts)
        srt_content = video_data.get("subtitles_srt", "1\n00:00:00,000 --> 00:00:10,000\nSUNDAY Video Subtitle\n")
        return Response(
            content=srt_content,
            media_type="text/plain",
            headers={"Content-Disposition": "attachment; filename=video_subtitles.srt"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"SRT export failed: {str(e)}")

@router.post("/zip")
async def export_all_zip_bundle(req: ExportRequest):
    try:
        source_title = req.meta.get("source_title", "SUNDAY_Transformation_Package") if req.meta else "SUNDAY_Package"
        zip_bytes = export_service.generate_zip_bundle(req.artefacts, source_title, req.meta)
        return Response(
            content=zip_bytes,
            media_type="application/zip",
            headers={"Content-Disposition": f"attachment; filename={source_title.replace(' ', '_')}_artefacts.zip"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"ZIP export failed: {str(e)}")
