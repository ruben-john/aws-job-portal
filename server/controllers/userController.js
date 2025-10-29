import JobApplication from "../models/jobApplication.js";
import User from "../models/User.js";
import { v2 as Cloudinary } from "cloudinary";
import Job from "../models/Job.js";
import Company from "../models/Company.js";
import { clerkClient } from '@clerk/express';
import { s3 } from "../config/s3.js";
import fs from "fs";

export const getUserData = async (req, res) => {
    const userId = req.auth.userId;
    try {
        let user = await User.findById(userId);
        if (!user) {
            // Lazy create from Clerk profile
            try {
                const clerkUser = await clerkClient.users.getUser(userId);
                const primaryEmail = clerkUser?.emailAddresses?.find(e => e.id === clerkUser.primaryEmailAddressId)?.emailAddress
                  || clerkUser?.emailAddresses?.[0]?.emailAddress
                  || '';
                const imageUrl = clerkUser?.imageUrl || '';
                const name = clerkUser?.fullName || clerkUser?.firstName || 'User';
                user = await User.create({ _id: userId, name, email: primaryEmail, image: imageUrl, resume: '' });
            } catch (e) {
                return res.json({ success: false, message: "User not Found" });
            }
        }
        res.json({ success: true, user });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

export const applyForJob = async (req, res) => {
    const { jobId } = req.body;
    const userId = req.auth.userId;

    try {
        const existingApps = await JobApplication.find({ jobId, userId });
        if (existingApps.length > 0) {
            return res.json({ success: false, message: 'Already Applied Job' });
        }

        const jobData = await Job.findById(jobId);
        if (!jobData) {
            return res.json({ success: false, message: 'Job Not Found' });
        }

        await JobApplication.create({
            companyId: jobData.companyId,
            userId,
            jobId,
            date: Date.now()
        });

        res.json({ success: true, message: 'Applied Successfully' });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

export const getUserJobApplication = async (req, res) => {
    try {
        const userId = req.auth.userId;
        const applications = await JobApplication.find({ userId });

        // Manually populate company and job data
        const populatedApps = await Promise.all((applications || []).map(async (app) => {
            const company = await Company.findById(app.companyId);
            const job = await Job.findById(app.jobId);
            return {
                ...app,
                companyId: company ? {
                    name: company.name,
                    email: company.email,
                    image: company.image,
                } : null,
                jobId: job ? {
                    title: job.title,
                    description: job.description,
                    location: job.location,
                    category: job.category,
                    level: job.level,
                    salary: job.salary,
                } : null,
            };
        }));

        if (!applications || populatedApps.length === 0) {
            return res.json({ success: true, applications: [] });
        }

        return res.json({ success: true, applications: populatedApps });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

export const updateUserResume = async (req, res) => {
    try {
        const userId = req.auth.userId;
        const resumeFile = req.file;

        let userData = await User.findById(userId);
        if (!userData) {
            // Create a minimal user if missing
            userData = await User.create({ _id: userId, name: 'User', email: '', image: '', resume: '' });
        }

        if (resumeFile) {
            const resumeUpload = await Cloudinary.uploader.upload(resumeFile.path);
            const s3Upload = await s3.upload({
                Bucket: process.env.S3_BUCKET_NAME1,
                Key: `resumes/${Date.now()}-${resumeFile.originalname}`,
                Body: fs.createReadStream(resumeFile.path),
                ContentType: resumeFile.mimetype
                }).promise();
             userData.resume = resumeUpload.secure_url;
             userData.resumeS3 = s3Upload.Location;
            await User.findByIdAndUpdate(userId, { resume: resumeUpload.secure_url });
        }

        return res.json({ success: true, message: 'Resume Updated' });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};
