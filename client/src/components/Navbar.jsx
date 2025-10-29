import React, { useContext } from 'react'
import { assets } from '../assets/assets.js';
import { useClerk, UserButton, useUser } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';
import { AppContext } from '../context/AppContext.jsx';

const Navbar = () => {

  const { openSignIn } = useClerk();
  const { user } = useUser();
  const { setShowRecruiterLogin } = useContext(AppContext);

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <div className="flex-shrink-0 cursor-pointer" onClick={() => window.location.href = '/'}>
            <img src={assets.logo} alt="Logo" className="h-10 w-auto" />
          </div>

          {/* Buttons */}
          {user ? (
            <div className="flex items-center space-x-4">
              <Link to="/applications" className="px-5 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 hover:shadow-lg transition-all duration-300 ease-in-out cursor-pointer">
                My Applications
              </Link>
              <p>Hi, {user.firstName + " " + user.lastName}</p>
              <UserButton />
            </div>
          ) : (
            <div className="flex space-x-4">
              <button onClick={() => setShowRecruiterLogin(true)} className="px-5 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 hover:shadow-lg transition-all duration-300 ease-in-out cursor-pointer">
                Recruiter Login
              </button>
              <button onClick={() => openSignIn()} className="px-5 py-2 bg-gray-200 text-gray-800 rounded-lg shadow-md hover:bg-gray-300 hover:shadow-lg transition-all duration-300 ease-in-out cursor-pointer">
                Login
              </button>
            </div>
          )}

        </div>
      </div>
    </nav>
  )
}

export default Navbar