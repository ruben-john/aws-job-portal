const STOPWORDS = new Set([
  "a","an","the","and","or","but","if","then","else","for","of","on","in","to","from","by","with","as","at","is","are","was","were","be","been","being","it","this","that","those","these","we","you","they","he","she","him","her","them","i","me","my","our","your","their","so","not","no","yes","do","did","done","does","can","could","should","would","will","just","about","over","under","than","too","very","more","most","such","per","via"
]);

export function tokenize(text) {
  return (text || "")
    .toLowerCase()
    .replace(/[^a-z0-9+.# ]+/g, " ")
    .split(/\s+/)
    .filter(t => t && t.length > 2 && !STOPWORDS.has(t));
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

import crypto from 'node:crypto';

export function hashText(text) {
  return crypto.createHash('sha256').update((text || '').trim()).digest('hex');
}


