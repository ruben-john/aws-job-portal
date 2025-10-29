import express from 'express';
import { getJobs, getJobById } from '../controllers/jobController.js';

const router = express.Router();

// Define your job-related routes here
router.get('/',getJobs);
router.get('/:id',getJobById);
export default router;