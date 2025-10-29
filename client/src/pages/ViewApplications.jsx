import React, { useContext, useEffect, useState } from 'react'
import { assets } from '../assets/assets'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import Loading from '../components/Loading'

const ViewApplications = () => {
  const { backendUrl, companyToken } = useContext(AppContext);
  const [applicants, setApplicants] = useState(false);

  const fetchCompanyJobApplications = async () => {
    try {
      const { data } = await axios.get(backendUrl + '/api/company/applicants', {
        headers: { token: companyToken },
      });
      if (data.success) {
        setApplicants(data.applicants.reverse());
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error);
    }
  };

  // Function To Update Job Application Status
  const changeJobApplicationStatus = async (id, status) => {
    try {
      const { data } = await axios.post(
        backendUrl + '/api/company/change-status',
        { id, status },
        { headers: { token: companyToken } }
      );
      if (data.success) {
        fetchCompanyJobApplications();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error);
    }
  };

  useEffect(() => {
    if (companyToken) {
      fetchCompanyJobApplications();
    }
  }, [companyToken]);

  return applicants ? (
    applicants.length === 0 ? (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-center text-gray-600">
        <img
          src="https://cdn-icons-png.flaticon.com/512/4076/4076549.png"
          alt="No applications"
          className="w-28 h-28 mb-4 opacity-80"
        />
        <p className="text-lg font-medium">No applications received yet</p>
        <p className="text-sm text-gray-500 mt-1">
          Once candidates apply to your jobs, their details will appear here.
        </p>
      </div>
    ) : (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto bg-white shadow-md rounded-2xl p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            View Applications
          </h2>

          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
              <thead className="bg-gray-100">
                <tr className="text-left text-gray-700">
                  <th className="px-4 py-3 text-sm font-semibold">#</th>
                  <th className="px-4 py-3 text-sm font-semibold">User Name</th>
                  <th className="px-4 py-3 text-sm font-semibold">Job Title</th>
                  <th className="px-4 py-3 text-sm font-semibold">Location</th>
                  <th className="px-4 py-3 text-sm font-semibold">Resume</th>
                  <th className="px-4 py-3 text-sm font-semibold">Action</th>
                </tr>
              </thead>

              <tbody>
                {applicants
                  .filter((item) => item.jobId && item.userId)
                  .map((applicant, index) => (
                    <tr
                      key={index}
                      className="border-t hover:bg-gray-50 transition duration-200"
                    >
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {index + 1}
                      </td>

                      <td className="px-4 py-3 flex items-center gap-3">
                        <img
                          src={applicant.userId.image}
                          alt={applicant.userId.name}
                          className="w-10 h-10 rounded-full object-cover border"
                        />
                        <span className="text-gray-800 font-medium">
                          {applicant.userId.name}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-gray-700">
                        {applicant.jobId.title}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {applicant.jobId.location}
                      </td>

                      <td className="px-4 py-3">
                        <a
                          href={applicant.userId.resume}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 transition"
                        >
                          <img
                            src={assets.resume_download_icon}
                            alt="download"
                            className="w-4 h-4"
                          />
                          <span>Resume</span>
                        </a>
                      </td>

                      {/* Action Buttons or Status */}
                      <td className="px-4 py-3 relative group">
                        {applicant.status === 'Pending' ? (
                          <div className="flex justify-center items-center">
                            <span className="text-gray-500 group-hover:hidden cursor-pointer">
                              ⋮
                            </span>
                            <div className="hidden group-hover:flex gap-2">
                              <button
                                onClick={() =>
                                  changeJobApplicationStatus(
                                    applicant._id,
                                    'Accepted'
                                  )
                                }
                                className="px-3 py-1 text-sm text-green-600 border border-green-500 rounded-lg hover:bg-green-50 transition"
                              >
                                Accept
                              </button>
                              <button
                                onClick={() =>
                                  changeJobApplicationStatus(
                                    applicant._id,
                                    'Rejected'
                                  )
                                }
                                className="px-3 py-1 text-sm text-red-600 border border-red-500 rounded-lg hover:bg-red-50 transition"
                              >
                                Reject
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div
                            className={`font-medium px-3 py-1 rounded-lg text-center w-fit mx-auto ${
                              applicant.status.toLowerCase() === 'accepted'
                                ? 'bg-green-100 text-green-700 border border-green-300'
                                : applicant.status.toLowerCase() === 'rejected'
                                ? 'bg-red-100 text-red-700 border border-red-300'
                                : 'text-gray-600'
                            }`}
                          >
                            {applicant.status}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  ) : (
    <Loading />
  );
};

export default ViewApplications;