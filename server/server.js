// Import necessary modules
import express from 'express';              // Express framework for building APIs
import cors from 'cors';                    // Middleware to enable Cross-Origin Resource Sharing
import dotenv from 'dotenv';                // To load environment variables from .env file
import connectDB from './config/db.js';     // Custom function to connect to DynamoDB
import './config/instrument.js';            // Initializes Sentry instrumentation (performance/error monitoring)
import * as Sentry from "@sentry/node";     // Sentry SDK for error tracking
import { clerkWebhooks } from './controllers/Webhooks.js'; // Clerk webhook handler
import companyRoutes from './routes/companyRoutes.js';      // Company-related API routes
import connectCloudinary from './config/cloudinary.js';
import jobRoutes from './routes/jobRoutes.js';
import userRoutes from './routes/userRoutes.js';
import recruiterRoutes from './routes/recruiterRoutes.js';
import testRoutes from './routes/testRoutes.js';
import {clerkMiddleware} from '@clerk/express'

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3005; // Default port 3005 if not specified in environment

// ---------------- Middleware ----------------
app.use(cors());              // Enable CORS for all routes
app.use(express.json());      // Parse incoming JSON request bodies
app.use(clerkMiddleware());

// ---------------- Database Connection ----------------
await connectDB();            // Connect to DynamoDB using the configuration in db.js
await connectCloudinary();
// ---------------- Routes ----------------

// Basic route to check if server is running
app.get('/', (req, res) => {
    res.send('Welcome to the ATS Backend Server');
});

// Route to manually trigger a Sentry test error
app.get('/debug-sentry', function mainHandler(req, res) {
    throw new Error("My first Sentry Error!");
});

// Clerk webhook listener endpoint
app.post('/webhooks', clerkWebhooks);
// Company-related routes (e.g., CRUD operations)
app.use('/api/company', companyRoutes);
// Job-related routes (e.g., job listings, details)
app.use('/api/jobs', jobRoutes);
//User-related routes
app.use('/api/users',userRoutes);
// Recruiter-related routes (ranking)
app.use('/api/recruiter', recruiterRoutes);
// Test routes
app.use('/test', testRoutes);

// ---------------- Sentry Error Handler ----------------
Sentry.setupExpressErrorHandler(app); // Capture and report unhandled exceptions to Sentry

// ---------------- Start Server ----------------
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

