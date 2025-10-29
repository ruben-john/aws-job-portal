import React, { use } from 'react'
import { assets } from '../assets/assets'
import { useNavigate } from 'react-router-dom';

const JobCard = ({ job }) => {

  const navigate = useNavigate();
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between h-full cursor-pointer">

      {/* Company Logo */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 flex items-center justify-center bg-gray-50 rounded-xl border border-gray-200">
          <img
            src={job.companyId.image}
            alt="Company logo"
            className="w-8 h-8 object-contain"
          />
        </div>
        <div>
          <h4 className="text-lg font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
            {job.title}
          </h4>
          <p className="text-sm text-gray-500">{job.company || 'Unknown Company'}</p>
        </div>
      </div>

      {/* Job Details */}
      <div className="flex items-center flex-wrap gap-3 text-sm text-gray-600 mb-3">
        <span className="flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-medium">
          <img src={assets.location_icon} alt="" className="w-4 h-4" />
          {job.location}
        </span>
        <span className="flex items-center gap-1 bg-green-50 text-green-700 px-3 py-1 rounded-full font-medium">
          {job.label}
        </span>
      </div>

      {/* Description */}
      <p
        className="text-gray-600 text-sm mb-5 leading-relaxed"
        dangerouslySetInnerHTML={{ __html: job.description.slice(0, 150) + '...' }}
      ></p>

      {/* Buttons */}
      <div className="flex items-center gap-3 mt-auto">
        <button onClick={() => { navigate(`/apply-job/${job._id}`); scrollTo(0, 0) }} className="flex-1 bg-blue-600 text-white font-medium py-2.5 rounded-lg hover:bg-blue-700 hover:scale-[1.02] transition-all duration-200 cursor-pointer">
          Apply Now
        </button>
        <button onClick={() => { navigate(`/apply-job/${job._id}`); scrollTo(0, 0) }} className="flex-1 border border-blue-600 text-blue-600 font-medium py-2.5 rounded-lg hover:bg-blue-50 hover:scale-[1.02] transition-all duration-200 cursor-pointer">
          Learn More
        </button>
      </div>
    </div>
  )
}

export default JobCard