import dotenv from "dotenv";
dotenv.config();
import JobApplication from "../models/jobApplication.js";
import Job from "../models/Job.js";
import User from "../models/User.js";
import { extractResumeTextFromUrl } from "../utils/resumeExtract.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY || "";
const modelName = process.env.GEMINI_MODEL || "gemini-flash-latest";
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

function requireGemini() {
  if (!genAI) return null;
  return genAI.getGenerativeModel({ model: modelName });
}

function truncate(text, max = 12000) {
  const t = text || "";
  return t.length > max ? t.slice(0, max) : t;
}

function safeParseJSON(s) {
  try {
    const trimmed = (s || "").trim().replace(/^```(json)?/i, "").replace(/```$/i, "").trim();
    return JSON.parse(trimmed);
  } catch {
    return null;
  }
}

export async function getCandidateSummary(req, res) {
  try {
    const { applicationId } = req.params;
    const app = await JobApplication.findById(applicationId);
    if (!app) return res.status(404).json({ success: false, message: "Application not found" });

    // Manually populate job and user
    const job = await Job.findById(app.jobId);
    const user = await User.findById(app.userId);

    const jdText = job?.description || "";
    let resumeText = app.resumeText || "";
    if (!resumeText && user?.resume) {
      try {
        resumeText = await extractResumeTextFromUrl(user.resume);
        await JobApplication.findByIdAndUpdate(applicationId, { resumeText });
      } catch (_) {}
    }

    const model = requireGemini();
    if (!model) return res.status(400).json({ success: false, message: "GEMINI_API_KEY not set" });

    const prompt = `Create a concise recruiter-friendly candidate brief based on the Job Description and Resume.
Return STRICT JSON with keys: summary (string), strengths (string[]), risks (string[]), fitScore (0-100), recommendedInterviewQuestions (string[]).

JD: ${truncate(jdText)}\n\nResume: ${truncate(resumeText)}\n\nJSON:`;
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    const json = safeParseJSON(text);
    if (!json) return res.status(502).json({ success: false, message: "AI response parsing failed" });

    return res.json({ success: true, candidate: { name: user?.name, email: user?.email }, job: { id: job?._id || job?.jobId, title: job?.title }, ...json });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || "Server error" });
  }
}

export async function generateEmailTemplate(req, res) {
  try {
    const { templateType, candidateName, jobTitle, companyName, tone } = req.body;
    const model = requireGemini();
    if (!model) return res.status(400).json({ success: false, message: "GEMINI_API_KEY not set" });
    const t = (templateType || "outreach").toLowerCase();
    const toneStr = tone || "professional, friendly";

    const prompt = `Write an email template as JSON ONLY with keys: subject, body.
Type: ${t} (one of outreach, rejection, offer)
Tone: ${toneStr}
Company: ${companyName || "Our Company"}
Candidate: ${candidateName || "Candidate"}
Role: ${jobTitle || "the role"}
Constraints: concise, personalized, clear CTA, no placeholders beyond given fields, no markdown fences.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    const json = safeParseJSON(text);
    if (!json) return res.status(502).json({ success: false, message: "AI response parsing failed" });
    return res.json({ success: true, template: json });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || "Server error" });
  }
}


