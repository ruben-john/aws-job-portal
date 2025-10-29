import React, { useRef } from 'react'
import { assets } from '../assets/assets'
import { useContext } from 'react'
import { AppContext } from '../context/AppContext'

const Hero = () => {

    const { setIsSearched, setSearchFilter } = useContext(AppContext);

    const titleRef = useRef(null);
    const locationRef = useRef(null);

    const onSearch = () => {
        const title = titleRef.current.value;
        const location = locationRef.current.value;

        setSearchFilter({
            title,
            location
        });

        console.log("Search clicked with:", { title, location });

        setIsSearched(true);
    }

    return (
        <div>
            <section className="bg-gradient-to-br from-purple-600 via-purple-700 to-purple-900 text-white py-20 px-6">
                <div className="max-w-5xl mx-auto text-center">
                    {/* Headings */}
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        Over <span className="text-purple-300">10,000</span> Jobs to Apply
                    </h1>
                    <p className="text-lg md:text-xl text-purple-100 mb-10">
                        Your next career move starts here. Explore top companies, discover exciting roles,
                        and take the first step toward your future.
                    </p>

                    {/* Search Bar */}
                    <div className="flex flex-col md:flex-row bg-white rounded-2xl overflow-hidden shadow-lg max-w-3xl mx-auto">
                        {/* Job search input */}
                        <div className="flex items-center gap-3 px-4 py-3 border-b md:border-b-0 md:border-r border-gray-200 flex-1">
                            <img src={assets.search_icon} alt="Search" className="w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search for jobs"
                                className="w-full outline-none text-gray-700 placeholder-gray-400"
                                ref={titleRef}
                            />
                        </div>

                        {/* Location input */}
                        <div className="flex items-center gap-3 px-4 py-3 border-b md:border-b-0 flex-1">
                            <img src={assets.location_icon} alt="Location" className="w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Location"
                                className="w-full outline-none text-gray-700 placeholder-gray-400"
                                ref={locationRef}
                            />
                        </div>

                        {/* Search button (inline, right side) */}
                        <button className="bg-pink-500 hover:bg-pink-600 transition-colors px-8 py-3 text-white font-medium md:rounded-none md:rounded-r-2xl cursor-pointer" onClick={onSearch}>
                            Search
                        </button>
                    </div>
                </div>
            </section>

            <div className="bg-white py-12 px-6">
                <div className="max-w-6xl mx-auto text-center">
                    {/* Heading */}
                    <p className="text-gray-600 text-lg font-medium mb-6">Trusted by</p>

                    {/* Logo Row */}
                    <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
                        <img
                            src={assets.microsoft_logo}
                            alt="Microsoft"
                            className="h-10 opacity-70 hover:opacity-100 transition-opacity cursor-pointer"
                        />
                        <img
                            src={assets.walmart_logo}
                            alt="Walmart"
                            className="h-10 opacity-70 hover:opacity-100 transition-opacity cursor-pointer"
                        />
                        <img
                            src={assets.accenture_logo}
                            alt="Accenture"
                            className="h-10 opacity-70 hover:opacity-100 transition-opacity cursor-pointer"
                        />
                        <img
                            src={assets.samsung_logo}
                            alt="Samsung"
                            className="h-10 opacity-70 hover:opacity-100 transition-opacity cursor-pointer"
                        />
                        <img
                            src={assets.amazon_logo}
                            alt="Amazon"
                            className="h-10 opacity-70 hover:opacity-100 transition-opacity cursor-pointer"
                        />
                        <img
                            src={assets.adobe_logo}
                            alt="Adobe"
                            className="h-10 opacity-70 hover:opacity-100 transition-opacity cursor-pointer"
                        />
                    </div>
                </div>
            </div>



        </div>
    )
}

export default Hero