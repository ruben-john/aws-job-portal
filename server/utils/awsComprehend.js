import { ComprehendClient, DetectKeyPhrasesCommand, DetectEntitiesCommand } from "@aws-sdk/client-comprehend";

const comprehendClient = new ComprehendClient({
  region: process.env.AWS_REGION,
  credentials: process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY ? {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  } : undefined,
});

export async function analyzeResumeText(text) {
  const truncated = (text || "").slice(0, 4900); // Comprehend text size limit safety
  try {
    const [phrasesRes, entitiesRes] = await Promise.all([
      comprehendClient.send(new DetectKeyPhrasesCommand({ LanguageCode: "en", Text: truncated })),
      comprehendClient.send(new DetectEntitiesCommand({ LanguageCode: "en", Text: truncated })),
    ]);

    const phrases = (phrasesRes.KeyPhrases || []).map(k => k.Text).filter(Boolean);
    const entities = (entitiesRes.Entities || []).map(e => ({ text: e.Text, type: e.Type })).filter(e => e.text);

    return { phrases, entities };
  } catch (err) {
    // Graceful fallback if AWS credentials not set or API errors
    return { phrases: extractKeyPhrasesFallback(truncated), entities: [] };
  }
}

function extractKeyPhrasesFallback(text) {
  const tokens = tokenize(text);
  // Naive extraction: return top frequent tokens > length 3
  const frequency = new Map();
  for (const t of tokens) {
    if (t.length < 4) continue;
    frequency.set(t, (frequency.get(t) || 0) + 1);
  }
  return Array.from(frequency.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 30)
    .map(([t]) => t);
}

export function tokenize(text) {
  return (text || "")
    .toLowerCase()
    .replace(/[^a-z0-9+.# ]+/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

export function computeJaccardSimilarity(aText, bText) {
  const a = new Set(tokenize(aText));
  const b = new Set(tokenize(bText));
  if (a.size === 0 || b.size === 0) return 0;
  let intersection = 0;
  for (const t of a) if (b.has(t)) intersection++;
  const union = a.size + b.size - intersection;
  return intersection / union;
}

export function estimateYearsOfExperience(text) {
  // Simple heuristic: look for patterns like "X years" or "X+ years"
  let years = 0;
  const regex = /(\d+)(\+)?\s*(years|yrs)/gi;
  let match;
  while ((match = regex.exec(text)) !== null) {
    years = Math.max(years, parseInt(match[1], 10));
  }
  return years;
}

export function countCertifications(text) {
  const patterns = [
    /certified/gi,
    /certification/gi,
    /certificate/gi,
    /aws\s*certified/gi,
    /pmp/gi,
    /scrum\s*master/gi,
  ];
  return patterns.reduce((sum, re) => sum + ((text || "").match(re) || []).length, 0);
}



