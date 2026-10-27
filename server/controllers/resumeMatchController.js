// Forwards the resume + job description to the n8n workflow and returns a clean JSON result.
// Requires Node 18+ (native fetch, FormData, Blob).

const CORE_FIELDS = [
  'matchScore', 'verdict', 'summary', 'experienceMatch', 'skillsMatch',
  'educationMatch', 'matchedSkills', 'missingSkills', 'recommendations',
];

const looksLikeAnalysis = (d) =>
  d && typeof d === 'object' && !Array.isArray(d) && CORE_FIELDS.some((k) => k in d);

function tryParseJsonString(value) {
  if (typeof value !== 'string') return null;
  let text = value.trim();
  if (text.startsWith('```')) {
    const lines = text.split('\n');
    if (lines[0].trim().startsWith('```')) lines.shift();
    if (lines.length && lines[lines.length - 1].trim() === '```') lines.pop();
    text = lines.join('\n').trim();
  }
  try {
    const parsed = JSON.parse(text);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch (_) { /* fall through */ }
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start >= 0 && end > start) {
    try {
      const parsed = JSON.parse(text.slice(start, end + 1));
      return parsed && typeof parsed === 'object' ? parsed : null;
    } catch (_) { return null; }
  }
  return null;
}

// Accepts the common n8n response shapes and returns the analysis object.
function normalizeN8nResponse(data) {
  if (Array.isArray(data)) {
    if (!data.length) return {};
    for (const item of data) {
      const n = normalizeN8nResponse(item);
      if (looksLikeAnalysis(n)) return n;
    }
    return normalizeN8nResponse(data[0]);
  }
  if (!data || typeof data !== 'object') return {};
  if (looksLikeAnalysis(data)) return data;

  for (const key of ['output', 'result', 'data', 'response', 'body', 'json', 'item']) {
    const nested = data[key];
    if (nested && typeof nested === 'object') {
      const n = normalizeN8nResponse(nested);
      if (Object.keys(n).length) return n;
    } else if (typeof nested === 'string') {
      const parsed = tryParseJsonString(nested);
      if (parsed) {
        const n = normalizeN8nResponse(parsed);
        if (Object.keys(n).length) return n;
      }
    }
  }
  for (const key of ['text', 'content', 'message']) {
    const value = data[key];
    if (typeof value === 'string') {
      const parsed = tryParseJsonString(value);
      if (parsed) {
        const n = normalizeN8nResponse(parsed);
        if (Object.keys(n).length) return n;
      }
    }
  }
  return data;
}

exports.matchResume = async (req, res) => {
  const webhookUrl = process.env.N8N_RESUME_MATCH_WEBHOOK_URL;
  if (!webhookUrl) {
    return res.status(500).json({ success: false, message: 'N8N_RESUME_MATCH_WEBHOOK_URL is not configured on the server.' });
  }
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'Please upload a PDF resume.' });
  }
  const jobDescription = (req.body.job_description || '').trim();
  if (!jobDescription) {
    return res.status(400).json({ success: false, message: 'Please enter the job description.' });
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 180000);

  try {
    const form = new FormData();
    form.append('resume', new Blob([req.file.buffer], { type: 'application/pdf' }), req.file.originalname);
    form.append('job_description', jobDescription);

    const response = await fetch(webhookUrl, { method: 'POST', body: form, signal: controller.signal });
    const raw = await response.text();

    if (!response.ok) {
      return res.status(502).json({ success: false, message: `The analysis service returned HTTP ${response.status}.` });
    }

    let json;
    try {
      json = JSON.parse(raw);
    } catch (_) {
      return res.status(502).json({ success: false, message: 'The analysis service did not return valid JSON.' });
    }

    const result = normalizeN8nResponse(json);
    if (!result || !Object.keys(result).length) {
      return res.status(502).json({ success: false, message: 'The analysis service returned an empty result.' });
    }
    return res.json({ success: true, result });
  } catch (err) {
    if (err.name === 'AbortError') {
      return res.status(504).json({ success: false, message: 'The analysis took too long. Please try again.' });
    }
    console.error('Resume match error:', err);
    return res.status(500).json({ success: false, message: 'Could not reach the analysis service.' });
  } finally {
    clearTimeout(timer);
  }
};
