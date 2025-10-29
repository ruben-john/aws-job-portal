import React from 'react'
import { assets } from '../assets/assets'

const AppDownload = () => {
  return (
    <section className="bg-gray-50 py-10 px-4 m-8">
      <div className="max-w-7xl mx-auto flex flex-col-reverse lg:flex-row items-center gap-6">

        {/* Text & Buttons */}
        <div className="flex-1 text-center lg:text-left">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">
            Download Mobile App for a Better Experience
          </h1>
          <p className="text-gray-600 mb-6">
            Get access to all jobs and updates on the go. Stay connected anytime, anywhere.
          </p>
          <div className="flex justify-center lg:justify-start gap-3">
            <a href="#" className="transform hover:scale-105 transition">
              <img src={assets.play_store} alt="Download on Play Store" className="h-12 sm:h-14" />
            </a>
            <a href="#" className="transform hover:scale-105 transition">
              <img src={assets.app_store} alt="Download on App Store" className="h-12 sm:h-14" />
            </a>
          </div>
        </div>

        {/* App Image */}
        <div className="flex-1 flex justify-center lg:justify-end">
          <img
            src={assets.app_main_img}
            alt="App Preview"
            className="w-56 sm:w-64 lg:w-full max-w-xs lg:max-w-sm rounded-xl shadow-lg"
          /> {/* Smaller image */}
        </div>
      </div>
    </section>
  )
}

export default AppDownload