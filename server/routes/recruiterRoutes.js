import express from 'express';
import { getRankedApplicants } from '../controllers/rankingController.js';
import protectCompany from '../middleware/authMiddleware.js';
import { getCandidateSummary, generateEmailTemplate } from '../controllers/aiController.js';

const router = express.Router();

// Returns ranked applicants for a given jobId
router.get('/:jobId/rankedApplicants', protectCompany, getRankedApplicants);
// Alias without "/summary" to support existing clients calling /application/:applicationId
router.get('/application/:applicationId', protectCompany, getCandidateSummary);
router.get('/application/:applicationId/summary', protectCompany, getCandidateSummary);
router.post('/emailTemplate', protectCompany, generateEmailTemplate);

export default router;


