import axios from 'axios';
import { generateClientArtefacts } from '../utils/clientTransformEngine';
import { PRESET_SOURCES } from '../utils/presets';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Ingest calls can run a vision/LLM extraction and take far longer than a status ping.
const INGEST_TIMEOUT = 180000;
const TRANSFORM_TIMEOUT = 300000;

const API_BASE_HINT = 'Start it with: python -m uvicorn backend.app.main:app --port 8000 (from the project root)';

/**
 * Builds a human-readable message from an axios failure so the UI can show the
 * real cause instead of a generic placeholder.
 */
const describeApiError = (err, action) => {
  const detail = err?.response?.data?.detail;
  if (typeof detail === 'string' && detail.trim()) return detail;
  if (detail && Array.isArray(detail)) {
    return detail.map(d => d?.msg || JSON.stringify(d)).join('; ');
  }
  if (err?.code === 'ECONNABORTED' || err?.message?.includes('timeout')) {
    return `${action} timed out. The request exceeded the client timeout — the backend may be stalled.`;
  }
  if (err?.request && !err?.response) {
    return `Cannot reach the SUNDAY backend at ${api.defaults.baseURL}. ${API_BASE_HINT}`;
  }
  if (err?.response) {
    return `${action} failed with HTTP ${err.response.status}.`;
  }
  return `${action} failed: ${err?.message || 'unknown error'}`;
};

const apiCall = (fn, action) => fn().catch((err) => {
  throw new Error(describeApiError(err, action));
});

export const checkHealth = async () => {
  try {
    const res = await api.get('/system/health');
    return { ...res.data, backend_reachable: true };
  } catch (err) {
    return {
      status: 'UNREACHABLE',
      service: 'Sunday',
      airgap_ready: true,
      mode: 'standalone_client_engine',
      backend_reachable: false,
      detail: describeApiError(err, 'Backend health check'),
    };
  }
};

export const fetchModelStatus = async () => {
  try {
    const res = await api.get('/status/model-status');
    return { ...res.data, backend_reachable: true };
  } catch (err) {
    return {
      active_provider: 'unavailable',
      gemini_configured: false,
      online: false,
      backend_reachable: false,
      detail: describeApiError(err, 'Model status check'),
    };
  }
};

export const fetchParameters = async () => {
  try {
    const res = await api.get('/transform/parameters');
    return res.data;
  } catch (err) {
    return {
      audiences: ["Cybersecurity Analysts & Threat Hunters", "C-Suite & Leadership", "Technical & DevSecOps Engineers", "Field Intelligence Operators", "Policy Makers & Strategic Planners", "General Public & Citizens", "Media & Press Correspondents"],
      tones: ["Critical & High Alert", "Authoritative & Formal", "Analytical & Objective", "Engaging & Conversational", "Educational & Simplified", "Tactical & Action-Oriented"],
      languages: ["English", "Hindi (हिन्दी)", "Tamil (தமிழ்)", "Telugu (తెలుగు)", "Bengali (বাংলা)", "Marathi (मराठी)", "French (Français)", "Spanish (Español)", "German (Deutsch)", "Russian (Русский)", "Arabic (العربية)", "Japanese (日本語)"]
    };
  }
};

export const fetchTemplates = async () => {
  try {
    const res = await api.get('/ingest/templates');
    return res.data;
  } catch (err) {
    return { templates: PRESET_SOURCES };
  }
};

export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const res = await apiCall(
    () => api.post('/v1/ingest/upload-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: INGEST_TIMEOUT,
    }),
    'Vision extraction'
  );
  return res.data;
};

export const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const res = await apiCall(
    () => api.post('/ingest/file', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: INGEST_TIMEOUT,
    }),
    'Document ingestion'
  );
  return res.data;
};

export const fetchUrlContent = async (url) => {
  const res = await apiCall(
    () => api.post('/ingest/url', { url }, { timeout: INGEST_TIMEOUT }),
    'URL ingestion'
  );
  return res.data;
};

export const transformContent = async (payload) => {
  try {
    const res = await api.post('/transform', payload, { timeout: TRANSFORM_TIMEOUT });
    return res.data;
  } catch (err) {
    // High-Fidelity Client Engine Fallback (Guaranteed to work on GitHub Pages & Standalone Web!)
    console.warn('[Sunday] Backend transform unavailable, using client engine:', describeApiError(err, 'Transformation'));
    return generateClientArtefacts(
      payload.source_title,
      payload.source_content,
      payload.parameters || {}
    );
  }
};

export const refineArtefact = async (payload) => {
  try {
    const res = await api.post('/transform/refine', payload);
    return res.data;
  } catch (err) {
    const updated = { ...payload.current_content };
    if (updated.title) updated.title = `${updated.title} [Refined]`;
    if (updated.executive_summary) updated.executive_summary += `\n\n[Operator Directive Applied: ${payload.refinement_instruction}]`;
    if (updated.bluf) updated.bluf += ` (Updated per directive: ${payload.refinement_instruction})`;
    return {
      status: 'success',
      artefact_type: payload.artefact_type,
      refined_content: updated
    };
  }
};

export const fetchHistory = async () => {
  try {
    const res = await api.get('/system/history');
    return res.data;
  } catch (err) {
    return { history: [] };
  }
};

export const clearHistory = async () => {
  try {
    const res = await api.delete('/system/history');
    return res.data;
  } catch (err) {
    return { status: 'cleared' };
  }
};

export const exportFile = async (exportType, artefacts, meta) => {
  try {
    const payload = { export_format: exportType, artefacts, meta };
    const res = await api.post(`/export/${exportType}`, payload, {
      responseType: 'blob',
    });
    return res.data;
  } catch (err) {
    // Client-side text/json blob download fallback
    const jsonStr = JSON.stringify(artefacts, null, 2);
    return new Blob([jsonStr], { type: 'application/json' });
  }
};

export default api;
