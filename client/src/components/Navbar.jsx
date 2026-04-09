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
    <nav className="glass shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <div className="flex-shrink-0 cursor-pointer" onClick={() => window.location.href = '/'}>
            <img src={assets.logo} alt="Logo" className="h-10 w-auto" />
          </div>

          {/* Buttons */}
          {user ? (
            <div className="flex items-center space-x-4">
              <Link to="/applications" className="px-5 py-2 btn-primary rounded-full cursor-pointer font-medium">
                My Applications
              </Link>
              <p>Hi, {user.firstName + " " + user.lastName}</p>
              <UserButton />
            </div>
          ) : (
            <div className="flex space-x-4">
              <button onClick={() => setShowRecruiterLogin(true)} className="px-5 py-2 btn-primary rounded-full cursor-pointer font-medium border border-transparent">
                Recruiter Login
              </button>
              <button onClick={() => openSignIn()} className="px-5 py-2 bg-white/60 backdrop-blur-md text-gray-800 rounded-full shadow-sm hover:scale-105 hover:bg-white/80 active:scale-95 transition-all duration-300 ease-in-out cursor-pointer font-medium border border-gray-200">
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