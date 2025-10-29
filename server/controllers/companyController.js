//Register a new company
import Company from '../models/Company.js';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import { v2 as cloudinary } from 'cloudinary';
import generateToken from '../utils/generateToken.js';
import Job from '../models/Job.js';
import JobApplication from '../models/jobApplication.js';
import { ses } from '../config/s3.js';
// -----------------------------------------------------
// REGISTER COMPANY
// -----------------------------------------------------
const registerCompany = async (req, res) => {
    const { name, email, password } = req.body;
    const imageFile = req.file;

    if (!name || !email || !password || !imageFile) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        // Check if company already exists
        const Companyexist = await Company.findOne({ email });
        if (Companyexist) {
            return res.status(400).json({ message: "Company with this email already exists" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const imageUpload = await cloudinary.uploader.upload(imageFile.path);

        const company = await Company.create({
            name,
            email,
            password: hashedPassword,
            image: imageUpload.secure_url,
        });

        res.json({
            success: true,
            message: "Company registered successfully",
            company: {
                id: company._id || company.companyId,
                name: company.name,
                email: company.email,
                image: company.image,
            },
            token: generateToken(company._id || company.companyId),
        });
    } catch (error) {
        console.error("Error registering company:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// -----------------------------------------------------
// LOGIN COMPANY
// -----------------------------------------------------
const loginCompany = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        const company = await Company.findOne({ email });
        if (!company) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        const isMatch = await bcrypt.compare(password, company.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        res.json({
            success: true,
            message: "Login successful",
            company: {
                id: company._id || company.companyId,
                name: company.name,
                email: company.email,
                image: company.image,
            },
            token: generateToken(company._id || company.companyId),
        });
    } catch (error) {
        console.error("Error logging in company:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// -----------------------------------------------------
// GET COMPANY DATA
// -----------------------------------------------------
const getCompanyData = async (req, res) => {
    try {
        const company = req.company; // from auth middleware

        if (!company) {
            return res.status(404).json({ message: "Company not found" });
        }

        res.json({ success: true, company });
    } catch (error) {
        console.error("Error fetching company data:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// -----------------------------------------------------
// POST A JOB
// -----------------------------------------------------
const postJob = async (req, res) => {
    const { title, description, location, salary, level, category } = req.body;
    const companyId = req.company._id; // from auth middleware

    if (!title || !description || !location || !salary || !level || !category) {
        return res.status(400).json({ message: "Title, description, and location are required" });
    }

    try {
        const newJob = await Job.create({
            title,
            description,
            location,
            salary,
            level,
            category,
            companyId: companyId.toString(),
            date: Date.now(),
            visible: true
        });
        res.json({
            success: true,
            message: "Job posted successfully",
            newJob
        });

    } catch (error) {
        console.error("Error posting job:", error);
        res.status(500).json({ message: "Server error" });

    }


};

// -----------------------------------------------------
// GET JOB APPLICANTS FOR A COMPANY’S JOB
// -----------------------------------------------------
const getCompanyJobApplicants = async (req, res) => {
    try {
        const companyId = req.company._id || req.company.companyId;

        // Find job applications for the company and populate related data
        const applications = await JobApplication.find({ companyId });
        
        // Manually populate user and job data
        const applicants = await Promise.all(applications.map(async (app) => {
            const user = await User.findById(app.userId);
            const job = await Job.findById(app.jobId);
            return {
                ...app,
                userId: user ? {
                    name: user.name,
                    email: user.email,
                    resume: user.resume,
                    image: user.image,
                } : null,
                jobId: job ? {
                    title: job.title,
                    location: job.location,
                    category: job.category,
                    level: job.level,
                    salary: job.salary,
                } : null,
            };
        }));

        return res.json({ success: true, applicants });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// -----------------------------------------------------
// GET COMPANY’S POSTED JOBS
// -----------------------------------------------------
const getCompanyPostedJobs = async (req, res) => {
    try {
        const companyId = req.company._id || req.company.companyId;

        const jobs = await Job.find({ companyId: companyId.toString() });

        // Adding no:of Applicants
        const jobsData = await Promise.all(jobs.map(async (job) => {
            const applicants = await JobApplication.find({ jobId: job._id || job.jobId });
            return { ...job, applicants: applicants.length };
        }));
        res.json({ success: true, jobsData });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// -----------------------------------------------------
// CHANGE APPLICATION STATUS (e.g., accepted/rejected)
// -----------------------------------------------------
const changeJobApplicationStatus = async (req, res) => {
    try {
      const { id, status } = req.body;
  
      if (!id || !status) {
        return res.status(400).json({ success: false, message: "Missing id or status" });
      }
  
       // ✅ Update the status first (DynamoDB model)
       const updatedApplication = await JobApplication.findByIdAndUpdate(
         id,
         { status }
       );
  
      if (!updatedApplication) {
        return res.status(404).json({ success: false, message: "Job application not found" });
      }
  
       // Fetch applicant details since populate is not available
       const userDoc = await User.findById(updatedApplication.userId);
       const applicantName = userDoc?.name || "Applicant";
       const applicantEmail = userDoc?.email;
  
      // ✅ Safety check
      if (!applicantEmail) {
        return res.status(400).json({ success: false, message: "Applicant email not found" });
      }
  
      // Customize the email subject + message
      const normalizedStatus = status.toLowerCase();
  
  const subject =
    normalizedStatus === "accepted"
      ? "🎉 Congratulations! Your job application was accepted"
      : "❌ Update on your job application";
  
  const bodyText =
    normalizedStatus === "accepted"
      ? `Hi ${applicantName},\n\nWe’re happy to inform you that your job application has been accepted!\nOur team will reach out to you with next steps.\n\nBest regards,\nRecruitment Team`
      : `Hi ${applicantName},\n\nWe regret to inform you that your application has not been shortlisted at this time.\nWe encourage you to apply for other roles in the future.\n\nBest wishes,\nRecruitment Team`;
  
      // Prepare email parameters
      const emailParams = {
        Source: "shafnaafreenali@gmail.com", // 👈 replace with verified SES email
        Destination: { ToAddresses: [applicantEmail] },
        Message: {
          Subject: { Data: subject },
          Body: { Text: { Data: bodyText } },
        },
      };
  
      // Try sending email, but don’t break the app if it fails
      try {
        await ses.sendEmail(emailParams).promise();
        console.log(`✅ Email sent to ${applicantEmail}`);
      } catch (emailError) {
        console.error("⚠ Email sending failed:", emailError.message);
      }
  
      res.json({
        success: true,
        message: "Status changed successfully",
        data: updatedApplication,
      });
  
    } catch (error) {
      console.error("Error changing job application status:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  };


// -----------------------------------------------------
// CHANGE COMPANY VISIBILITY (e.g., visible/invisible to users)
// -----------------------------------------------------
const changeVisibility = async (req, res) => {
    try {
        const { id } = req.body;
        const companyId = req.company._id || req.company.companyId;

        const job = await Job.findById(id);
        if (!job) {
            return res.status(404).json({ success: false, message: 'Job not found' });
        }

        if (companyId.toString() === job.companyId.toString()) {
            await Job.findByIdAndUpdate(id, { visible: !job.visible });
            job.visible = !job.visible;
        }

        res.json({
            success: true,
            job
        });
    } catch (error) {
        console.error("Error changing visibility:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// -----------------------------------------------------
export {
    registerCompany,
    loginCompany,
    getCompanyData,
    postJob,
    getCompanyJobApplicants,
    getCompanyPostedJobs,
    changeJobApplicationStatus,
    changeVisibility,
};
