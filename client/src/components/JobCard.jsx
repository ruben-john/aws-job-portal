import React, { use } from 'react'
import { assets } from '../assets/assets'
import { useNavigate } from 'react-router-dom';

const JobCard = ({ job }) => {

  const navigate = useNavigate();
  return (
    <div className="glass-card rounded-2xl p-6 flex flex-col justify-between h-full cursor-pointer mt-2">

      {/* Company Logo */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 flex items-center justify-center bg-white/60 rounded-xl border border-white/50 shadow-sm">
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
      <div
        className="text-gray-600 text-sm mb-5 leading-relaxed font-sans"
        dangerouslySetInnerHTML={{ __html: String(job.description).slice(0, 150) + '...' }}
      ></div>

      {/* Buttons */}
      <div className="flex items-center gap-3 mt-auto">
        <button onClick={() => { navigate(`/apply-job/${job._id}`); scrollTo(0, 0) }} className="flex-1 btn-primary py-2.5 rounded-full cursor-pointer text-sm font-semibold">
          Apply Now
        </button>
        <button onClick={() => { navigate(`/apply-job/${job._id}`); scrollTo(0, 0) }} className="flex-1 border border-indigo-200/60 text-indigo-700 bg-white/50 backdrop-blur-sm font-semibold py-2.5 rounded-full hover:bg-white/80 hover:scale-[1.05] active:scale-[0.95] transition-all duration-300 cursor-pointer text-sm shadow-sm">
          Learn More
        </button>
      </div>
    </div>
  )
}

export default JobCard