import dotenv from "dotenv";
dotenv.config();
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY || "";
let genAI = null;
if (apiKey) {
  genAI = new GoogleGenerativeAI(apiKey);
}

function truncate(text, max = 12000) {
  const t = text || "";
  return t.length > max ? t.slice(0, max) : t;
}

export async function geminiAnalyzeResume(jdText, resumeText) {
  if (!genAI) throw new Error("GEMINI_API_KEY not set");
  const modelName = process.env.GEMINI_MODEL || "gemini-flash-latest";
  const model = genAI.getGenerativeModel({ model: modelName });

  const prompt = `Act as a professional ATS scorer for recruiters. Perform SEMANTIC analysis between the Job Description (JD) and the Resume.

Requirements:
- Ignore stopwords/filler words entirely (e.g., a, an, the, for, of, to, in, on, is, are, etc.).
- Consider synonyms, related skills, frameworks, libraries (e.g., Node ≈ Node.js, React ≈ ReactJS).
- Weight domain-relevant experience and seniority (years, role level) higher than generic text.
- Penalize fluff and keyword stuffing that is unrelated to the JD.
- Extract real skills/entities; do not include stopwords as skills.
- Estimate years of experience from resume content.

Scoring:
- jdMatchScore (0-100): semantic relevance of resume to JD, considering synonyms and context.
- resumeQualityScore (0-100): quality based on clarity, structure, quantified impact, years, certifications, breadth/depth of skills.

Output JSON ONLY with keys:
{
  "jdMatchScore": number,
  "resumeQualityScore": number,
  "matchedKeywords": string[],
  "missingSkills": string[],
  "extractedSkills": string[],
  "estimatedYearsExperience": number,
  "certificationsCount": number
}

JD:\n${truncate(jdText)}\n\nResume:\n${truncate(resumeText)}\n\nJSON:`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  const json = safeParseJson(text);
  return json;
}

function safeParseJson(s) {
  try {
    // Some models wrap JSON in markdown code fences
    const trimmed = s.trim().replace(/^```(json)?/i, "").replace(/```$/, "").trim();
    return JSON.parse(trimmed);
  } catch (e) {
    return {
      jdMatchScore: 0,
      resumeQualityScore: 0,
      matchedKeywords: [],
      missingSkills: [],
      extractedSkills: [],
      estimatedYearsExperience: 0,
      certificationsCount: 0
    };
  }
}


