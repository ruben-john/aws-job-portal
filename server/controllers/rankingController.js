import Job from "../models/Job.js";
import JobApplication from "../models/jobApplication.js";
import User from "../models/User.js";
import { extractResumeTextFromUrl } from "../utils/resumeExtract.js";
import { geminiAnalyzeResume } from "../utils/gemini.js";
import { tokenize, computeJaccardSimilarity, estimateYearsOfExperience, countCertifications, hashText } from "../utils/textUtils.js";

function computeResumeQualityScore(resumeText, skills = []) {
  const tokens = tokenize(resumeText);
  const uniqueTokens = new Set(tokens);
  const years = estimateYearsOfExperience(resumeText);
  const certs = countCertifications(resumeText);

  const normalizedSkills = (skills || []).map(s => s.toLowerCase());
  let skillMatches = 0;
  for (const s of normalizedSkills) if (uniqueTokens.has(s)) skillMatches++;

  const yearsScore = Math.min(20, years) / 20 * 40;
  const skillsScore = Math.min(15, skillMatches) / 15 * 40;
  const certsScore = Math.min(5, certs) / 5 * 20;
  return Math.round(yearsScore + skillsScore + certsScore);
}

function computeJdMatchScore(jdText, resumeText, extractedPhrases = []) {
  const jaccard = computeJaccardSimilarity(jdText, resumeText);
  const jdTokens = new Set(tokenize(jdText));
  let phraseMatches = 0;
  for (const p of extractedPhrases) if (jdTokens.has(p.toLowerCase())) phraseMatches++;
  const phraseBoost = Math.min(phraseMatches, 20) / 20 * 0.2;
  const score = Math.min(1, jaccard + phraseBoost) * 100;
  return Math.round(score);
}

function toRange(value, min, max) {
  const num = Number(value);
  if (Number.isNaN(num)) return min;
  return Math.max(min, Math.min(max, Math.round(num)));
}

export async function getRankedApplicants(req, res) {
  try {
    const { jobId } = req.params;
    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ success: false, message: "Job not found" });

    const applications = await JobApplication.find({ jobId });
    const jdText = job.description || "";

    const results = [];
    for (const app of applications) {
      const user = await User.findById(app.userId);
      if (!user) continue;
      
      let resumeText = app.resumeText || "";

      if (!resumeText && user.resume) {
        try {
          resumeText = await extractResumeTextFromUrl(user.resume);
          await JobApplication.findByIdAndUpdate(app.applicationId || app._id, { resumeText });
        } catch (e) {
          resumeText = "";
        }
      }

      const jdHash = hashText(jdText);
      const resumeHash = hashText(resumeText);
      const cache = app.rankingCache || {};

      if (cache.jdHash === jdHash && cache.resumeHash === resumeHash && typeof cache.finalScore === 'number' && cache.finalScore > 0) {
        results.push({
          applicationId: app.applicationId || app._id,
          applicant: { id: user._id, name: user.name, email: user.email },
          resumeUrl: user.resume || "",
          scores: { jdMatchScore: cache.jdMatchScore || 0, resumeQualityScore: cache.resumeQualityScore || 0, finalScore: cache.finalScore || 0 },
          provider: cache.provider || 'cache',
          providerError: '',
          matchedKeywords: cache.matchedKeywords || [],
          missingSkills: cache.missingSkills || [],
        });
        continue;
      }

      let jdMatchScore = 0;
      let resumeQualityScore = 0;
      let matchedKeywords = [];
      let missingSkills = [];
      let provider = 'fallback';
      let providerError = '';
      
      try {
        const g = await geminiAnalyzeResume(jdText, resumeText);
        jdMatchScore = toRange(g.jdMatchScore, 0, 100);
        resumeQualityScore = toRange(g.resumeQualityScore, 0, 100);
        matchedKeywords = Array.isArray(g.matchedKeywords) ? g.matchedKeywords : [];
        missingSkills = Array.isArray(g.missingSkills) ? g.missingSkills : [];
        provider = 'gemini';
      } catch (e) {
        providerError = e?.message || 'unknown';
        const phrases = [];
        jdMatchScore = computeJdMatchScore(jdText, resumeText, phrases);
        resumeQualityScore = computeResumeQualityScore(resumeText);
        const jdTokens = new Set(tokenize(jdText));
        const resumeTokens = new Set(tokenize(resumeText));
        matchedKeywords = Array.from(jdTokens).filter(t => resumeTokens.has(t)).slice(0, 30);
        missingSkills = Array.from(jdTokens).filter(t => !resumeTokens.has(t)).slice(0, 30);
      }

      const finalScore = Math.round(0.7 * jdMatchScore + 0.3 * resumeQualityScore);

      try {
        await JobApplication.findByIdAndUpdate(app.applicationId || app._id, {
          rankingCache: {
            jdHash,
            resumeHash,
            provider,
            jdMatchScore,
            resumeQualityScore,
            finalScore,
            matchedKeywords,
            missingSkills,
            computedAt: new Date().toISOString(),
          },
        });
      } catch (_) {}

      results.push({
        applicationId: app.applicationId || app._id,
        applicant: { id: user._id, name: user.name, email: user.email },
        resumeUrl: user.resume || "",
        scores: { jdMatchScore, resumeQualityScore, finalScore },
        provider,
        providerError,
        matchedKeywords,
        missingSkills,
      });
    }

    results.sort((a, b) => b.scores.finalScore - a.scores.finalScore);
    return res.json({ success: true, job: { id: job._id || job.jobId, title: job.title }, rankedApplicants: results });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
