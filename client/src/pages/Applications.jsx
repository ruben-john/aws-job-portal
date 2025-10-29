import React, { useContext, useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import { assets } from '../assets/assets'
import moment from 'moment'
import Footer from '../components/Footer'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useUser, useAuth } from '@clerk/clerk-react'

const Applications = () => {
  const [isEdit, setIsEdit] = useState(false)
  const [resume, setResume] = useState(null)
  const [uploadedResumeName, setUploadedResumeName] = useState(null)
  const [isUploading, setIsUploading] = useState(false)

  const { user } = useUser()
  const { getToken } = useAuth()

  const { backendUrl, userData, fetchUserData, userApplications, fetchUserApplications } =
    useContext(AppContext)

  const updateResume = async () => {
    if (!resume) {
      toast.error('Please upload a resume before saving.')
      return
    }

    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append('resume', resume)

      const token = await getToken()

      const { data } = await axios.post(`${backendUrl}/api/users/update-resume`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (data.success) {
        toast.success(data.message)
        setUploadedResumeName(resume.name)
        await fetchUserData() // refresh user info
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }

    setIsUploading(false)
    setIsEdit(false)
    setResume(null)
  }

  useEffect(() => {
    if (user) {
      fetchUserApplications()
    }
  }, [user])

  return (
    <>
      <Navbar />
      <div className="max-w-6xl mx-auto p-6 lg:p-10">
        {/* Resume Section */}
        <section className="bg-white shadow-md rounded-2xl p-6 mb-10 border border-gray-100">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 border-b pb-2">Your Resume</h2>

          {isEdit ? (
            // =========================
            // Upload/Edit Mode
            // =========================
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
              <h3 className="text-lg font-medium text-gray-700 mb-4">
                {userData?.resume ? 'Update your resume' : 'Upload your resume'}
              </h3>

              <label
                htmlFor="resumeUpload"
                className="flex items-center justify-center gap-3 p-4 border-2 border-dashed border-blue-400 rounded-xl bg-blue-50 hover:bg-blue-100 transition cursor-pointer"
              >
                <input
                  id="resumeUpload"
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => setResume(e.target.files[0])}
                  className="hidden"
                />
                <img src={assets.profile_upload_icon} alt="Upload" className="w-6 h-6 opacity-80" />
                <span className="text-gray-700 font-medium">
                  {resume ? resume.name : 'Click to upload a PDF file'}
                </span>
              </label>

              {isUploading && (
                <p className="text-blue-600 text-sm mt-4 flex items-center gap-2">
                  <svg
                    className="animate-spin h-4 w-4 text-blue-600"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8H4z"
                    ></path>
                  </svg>
                  Uploading your resume...
                </p>
              )}

              <div className="mt-6 flex gap-4 justify-end">
                <button
                  onClick={updateResume}
                  type="submit"
                  disabled={isUploading}
                  className={`px-5 py-2 rounded-lg transition ${
                    isUploading
                      ? 'bg-blue-400 text-white cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {isUploading ? 'Uploading...' : 'Save'}
                </button>
                <button
                  onClick={() => setIsEdit(false)}
                  disabled={isUploading}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-5 py-2 rounded-lg transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            // =========================
            // Display Mode
            // =========================
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">Current Resume</h3>

                {userData?.resume ? (
                  <div className="flex items-center gap-4">
                    <p className="text-gray-500 text-sm">
                      {uploadedResumeName || userData.resumeName || 'resume.pdf'}
                    </p>
                    <a
                      href={userData.resume}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-green-100 hover:bg-green-200 text-green-700 border border-green-300 rounded-lg text-sm font-medium transition"
                    >
                      View Resume
                    </a>
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No resume uploaded yet.</p>
                )}
              </div>

              <button
                onClick={() => setIsEdit(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg transition"
              >
                {userData?.resume ? 'Edit Resume' : 'Upload Resume'}
              </button>
            </div>
          )}
        </section>

        {/* Applied Jobs Section */}
        <section className="bg-white shadow-md rounded-2xl p-6 border border-gray-100">
          <div className="flex justify-between items-center mb-6 border-b pb-2">
            <h2 className="text-2xl font-semibold text-gray-800">Applied Jobs</h2>
            <span className="text-gray-500 text-sm">Total: {userApplications.length}</span>
          </div>

          {userApplications.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-left text-gray-700 text-sm uppercase tracking-wide">
                    <th className="border-b p-3">Company</th>
                    <th className="border-b p-3">Title</th>
                    <th className="border-b p-3">Location</th>
                    <th className="border-b p-3">Date</th>
                    <th className="border-b p-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {userApplications.map((job, index) => (
                    <tr
                      key={index}
                      className="hover:bg-blue-50 transition text-gray-700 text-sm border-b"
                    >
                      <td className="p-3 flex items-center gap-3">
                        <img
                          src={job.companyId.image}
                          alt={job.companyId.image}
                          className="w-8 h-8 object-contain rounded-md"
                        />
                        <span className="font-medium">{job.company}</span>
                      </td>
                      <td className="p-3">{job.jobId.title}</td>
                      <td className="p-3">{job.jobId.location}</td>
                      <td className="p-3">{moment(job.appliedAt).format('MMM DD, YYYY')}</td>
                      <td className="p-3">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold
                            ${
                              job.status === 'Accepted'
                                ? 'bg-green-100 text-green-700'
                                : job.status === 'Pending'
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-red-100 text-red-700'
                            }`}
                        >
                          {job.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-10">
              You haven’t applied for any jobs yet.
            </p>
          )}
        </section>
      </div>
      <Footer />
    </>
  )
}

export default Applications