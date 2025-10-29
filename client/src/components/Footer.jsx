import React from 'react'
import { assets } from '../assets/assets'

const Footer = () => {
  return (
    <footer className="bg-gray-100 py-8 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">

        {/* Logo & Copyright */}
        <div className="flex flex-col items-center md:items-start">
          <img src={assets.logo} alt="Logo" className="h-12 mb-2" />
          <p className="text-gray-600 text-sm">© {new Date().getFullYear()} Kisan. All rights reserved.</p>
        </div>

        {/* Quick Links */}
        <div className="flex gap-6 text-gray-700 text-sm">
          <a href="#" className="hover:text-gray-900 transition">Home</a>
          <a href="#" className="hover:text-gray-900 transition">Jobs</a>
          <a href="#" className="hover:text-gray-900 transition">About</a>
          <a href="#" className="hover:text-gray-900 transition">Contact</a>
        </div>

        {/* Social Icons */}
        <div className="flex gap-4">
          <a href="#" className="hover:opacity-80 transition">
            <img src={assets.facebook_icon} alt="Facebook" className="h-6 w-6" />
          </a>
          <a href="#" className="hover:opacity-80 transition">
            <img src={assets.instagram_icon} alt="Instagram" className="h-6 w-6" />
          </a>
          <a href="#" className="hover:opacity-80 transition">
            <img src={assets.twitter_icon} alt="Twitter" className="h-6 w-6" />
          </a>
        </div>

      </div>
    </footer>
  )
}

export default Footer