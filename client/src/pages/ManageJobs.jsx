import React, { useEffect, useState, useContext } from 'react'
import moment from 'moment'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'
import { AppContext } from '../context/AppContext'

const ManageJobs = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const { backendUrl, companyToken } = useContext(AppContext);

  const fetchCompanyJobs = async () => {
    try {
      const { data } = await axios.get(backendUrl + '/api/company/list-jobs', { headers: { token: companyToken } });
      if (data.success) {
        setJobs(data.jobsData.reverse());
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error);
    }
  };

  // Function to change Job Visibility
  const changeJobVisibility = async (id) => {
    try {
      const { data } = await axios.post(
        backendUrl + '/api/company/change-visibility',
        { id },
        { headers: { token: companyToken } }
      );

      if (data.success) {
        toast.success(data.message);
        fetchCompanyJobs();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error);
    }
  };

  useEffect(() => {
    if (companyToken) {
      fetchCompanyJobs();
    }
  }, [companyToken]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-md p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">Manage Jobs</h2>
          <button
            onClick={() => navigate('/dashboard/add-job')}
            className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition duration-200 shadow-sm"
          >
            + Add New Job
          </button>
        </div>

        {/* No Jobs Message */}
        {jobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center text-gray-600">
            <img
              src="https://cdn-icons-png.flaticon.com/512/4076/4076549.png"
              alt="No jobs"
              className="w-28 h-28 mb-4 opacity-80"
            />
            <p className="text-lg font-medium">No jobs posted yet</p>
            <p className="text-sm text-gray-500 mt-1">
              Click the “Add New Job” button to create your first job listing.
            </p>
          </div>
        ) : (
          // Jobs Table
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
              <thead className="bg-gray-100">
                <tr className="text-left text-gray-700">
                  <th className="px-4 py-3 text-sm font-semibold">#</th>
                  <th className="px-4 py-3 text-sm font-semibold">Job Title</th>
                  <th className="px-4 py-3 text-sm font-semibold">Date</th>
                  <th className="px-4 py-3 text-sm font-semibold">Location</th>
                  <th className="px-4 py-3 text-sm font-semibold">Applicants</th>
                  <th className="px-4 py-3 text-sm font-semibold">Actions</th>
                  <th className="px-4 py-3 text-sm font-semibold">Visible</th>
                </tr>
              </thead>

              <tbody>
                {jobs.map((job, index) => (
                  <tr
                    key={index}
                    className="border-t hover:bg-gray-50 transition duration-200"
                  >
                    <td className="px-4 py-3 text-sm text-gray-700">{index + 1}</td>
                    <td className="px-4 py-3 text-gray-800 font-medium">{job.title}</td>
                    <td className="px-4 py-3 text-gray-600">{moment(job.date).format('ll')}</td>
                    <td className="px-4 py-3 text-gray-600">{job.location}</td>
                    <td className="px-4 py-3 text-gray-600">{job.applicants}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => navigate(`/dashboard/ranked-applicants/${job._id}`)}
                        className="px-3 py-1.5 text-sm rounded-lg bg-gray-800 text-white hover:bg-black transition shadow-sm"
                      >
                        View Ranked Applicants
                      </button>
                    </td>
                    <td className="px-4 py-3 flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={job.visible}
                        onChange={() => changeJobVisibility(job._id)}
                        className="w-4 h-4 accent-blue-600 cursor-pointer"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageJobs;