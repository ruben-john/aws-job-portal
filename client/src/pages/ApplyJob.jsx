import React, { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import Navbar from '../components/Navbar';
import { assets } from '../assets/assets';
import kconvert from 'k-convert';
import moment from 'moment';
import JobCard from '../components/JobCard';
import Footer from '../components/Footer';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '@clerk/clerk-react';

const ApplyJob = () => {
    const navigate = useNavigate();
    const { getToken } = useAuth();
    const { id } = useParams();
    const [jobData, setJobData] = useState(null);
    const [isAlreadyApplied, setIsAlreadyApplied] = useState(false);

    const {
        jobs,
        backendUrl,
        userData,
        userApplications,
        fetchUserApplications 
    } = useContext(AppContext);

    // Fetch job details
    const fetchJobData = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/jobs/${id}`);
            if (data.success) {
                setJobData(data.job);
                console.log(data.job);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error("Error fetching job data:", error);
        }
    };

    // Check if user already applied
    const checkAlreadyApplied = () => {
        if (!userApplications || !jobData) return;

        const jobIdsToMatch = [jobData._id, jobData.jobId];
        const applied = userApplications.some((item) => {
            const jobObj = item.jobId || {};
            return jobIdsToMatch.includes(jobObj._id) || jobIdsToMatch.includes(jobObj.jobId);
        });

        setIsAlreadyApplied(applied);
    };

    // Apply to job
    const applyHandler = async () => {
        try {
            if (!userData) {
                toast.error('Login To Apply');
                return;
            }

            if (!userData.resume) {
                toast.error('Upload Resume to Apply');
                navigate('/applications');
                return;
            }

            if (isAlreadyApplied) {
                toast.info("You have already applied for this job.");
                return;
            }

            const token = await getToken();
            const { data } = await axios.post(
                `${backendUrl}/api/users/apply`,
                { jobId: jobData._id },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (data.success) {
                toast.success(data.message);
                setIsAlreadyApplied(true); // update immediately
                fetchUserApplications();    // refresh user's applications
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error(error);
            toast.error("Something went wrong while applying.");
        }
    };

    // Run when component mounts
    useEffect(() => {
        fetchJobData();
    }, [id]);

    // Check if already applied whenever jobData or userApplications change
    useEffect(() => {
        if (jobData && userApplications && userApplications.length > 0) {
            checkAlreadyApplied();
        }
    }, [jobData, userApplications, id]);

    return (
        <div className="bg-gray-50 min-h-screen">
            <Navbar />

            {jobData ? (
                <div>
                    <div className="max-w-7xl mx-auto py-12 px-6 flex flex-col lg:flex-row gap-10">

                        {/* Left Column: Job Details + Description */}
                        <div className="flex-1 flex flex-col gap-8">
                            <div className="bg-white shadow-2xl rounded-3xl p-8 flex flex-col gap-6">
                                <div className="flex items-center gap-6">
                                    <img
                                        src={jobData.companyId.image}
                                        alt={jobData.companyId.name}
                                        className="w-20 h-20 object-cover rounded-full shadow-md"
                                    />
                                    <h1 className="text-3xl font-bold text-gray-800">{jobData.title}</h1>
                                </div>

                                <div className="flex flex-wrap items-center gap-4 text-gray-600">
                                    <span className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-lg hover:bg-blue-50 transition">
                                        <img src={assets.suitcase_icon} className="w-5 h-5" />
                                        {jobData.companyId.name}
                                    </span>
                                    <span className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-lg hover:bg-blue-50 transition">
                                        <img src={assets.location_icon} className="w-5 h-5" />
                                        {jobData.location}
                                    </span>
                                    <span className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-lg hover:bg-blue-50 transition">
                                        <img src={assets.person_icon} className="w-5 h-5" />
                                        {jobData.level}
                                    </span>
                                    <span className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-lg hover:bg-blue-50 transition">
                                        <img src={assets.money_icon} className="w-5 h-5" />
                                        CTC: {kconvert.convertTo(jobData.salary)}
                                    </span>

                                    {/* Apply Button + Posted */}
                                    <div className="ml-auto flex flex-col items-end mt-2 lg:mt-0">
                                        <button
                                            onClick={applyHandler}
                                            disabled={isAlreadyApplied}
                                            className={`${
                                                isAlreadyApplied
                                                    ? "bg-gray-400 cursor-not-allowed"
                                                    : "bg-blue-600 hover:bg-blue-700"
                                            } text-white font-semibold px-6 py-3 rounded-xl shadow-lg transition transform hover:scale-105`}
                                        >
                                            {isAlreadyApplied ? "Already Applied" : "Apply Now"}
                                        </button>
                                        <span className="text-gray-400 mt-2 text-right text-sm">
                                            Posted {moment(jobData.data).fromNow()}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Job Description */}
                            <div className="bg-gray-50 rounded-2xl p-6 shadow-inner">
                                <h2 className="text-2xl font-semibold mb-4 text-gray-700">Job Description</h2>
                                <div className="text-gray-600 leading-relaxed space-y-4" dangerouslySetInnerHTML={{ __html: jobData.description }}></div>
                            </div>
                        </div>

                        {/* Right Column: More Jobs */}
                        <div className="w-full lg:w-96 flex-shrink-0 flex flex-col gap-4">
                            <h2 className="text-2xl font-semibold mb-4 text-gray-700">More Jobs from {jobData.companyId.name}</h2>
                            {jobs
                                .filter(job => job.companyId._id === jobData.companyId._id && job._id !== jobData._id)
                                .filter(job=>{
                                    const appliedJobsId=new Set(userApplications.map(app=>app.jobId && app.jobId._id))

                                    return !appliedJobsId.has(job._id)
                                })
                                .slice(0, 4)
                                .map((job, index) => (
                                    <JobCard key={job._id || index} job={job} />
                                ))}
                        </div>

                    </div>

                    <Footer />

                </div>

            ) : (
                <div className="flex justify-center items-center py-20">
                    <div className="w-14 h-14 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
                </div>
            )}

        </div>
    );
};

export default ApplyJob;