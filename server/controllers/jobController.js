import Job from "../models/Job.js";
import Company from "../models/Company.js";

export const getJobs = async (req, res) => {
    try {
        const jobsData = await Job.find({ visible: true });
        
        // Manually populate company data (DynamoDB doesn't support populate)
        const jobs = await Promise.all(jobsData.map(async (job) => {
            const company = await Company.findById(job.companyId);
            return {
                ...job,
                companyId: company ? {
                    _id: company._id,
                    name: company.name,
                    email: company.email,
                    image: company.image,
                } : null,
            };
        }));

        res.json({ success: true, jobs });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

export const getJobById = async (req, res) => {
    try {
        const { id } = req.params;
        const job = await Job.findById(id);

        if (!job) {
            return res.json({
                success: false,
                message: 'Job not found'
            });
        }

        // Populate company data
        const company = await Company.findById(job.companyId);
        job.companyId = company ? {
            _id: company._id,
            name: company.name,
            email: company.email,
            image: company.image,
        } : null;

        res.json({ success: true, job });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};
