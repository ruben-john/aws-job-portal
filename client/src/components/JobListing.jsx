import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { assets, JobCategories, JobLocations } from '../assets/assets';
import JobCard from './JobCard';

const JobListing = () => {
    const { isSearched, searchFilter, setSearchFilter, jobs } = useContext(AppContext);

    const [currentPage, setCurrentPage] = useState(1);

    const [selectedCategories, setSelectedCategories] = useState([])
    const [selectedLocations, setSelectedLocations] = useState([])
    const [filteredJobs, setFilteredJobs] = useState(jobs)

    const handleCategoryChange = (category) => {
        setSelectedCategories((prev) => {
            if (prev.includes(category)) {
                return prev.filter((cat) => cat !== category);
            }
            return [...prev, category];
        }

        );
    };

    const handleLocationChange = (location) => {
        setSelectedLocations((prev) => {
            if (prev.includes(location)) {
                return prev.filter((loc) => loc !== location);
            }
            return [...prev, location];
        });
    };

    useEffect(() => {

        const matchCategory = (job) => {
            if (selectedCategories.length === 0) return true;
            return selectedCategories.includes(job.category);
        }

        const matchLocation = (job) => {
            if (selectedLocations.length === 0) return true;
            return selectedLocations.includes(job.location);
        }

        const matchTitle = (job) => {
            if (searchFilter.title === '') return true;
            return job.title.toLowerCase().includes(searchFilter.title.toLowerCase());
        }

        const matchLocationFilter = (job) => {
            if (searchFilter.location === '') return true;
            return job.location.toLowerCase().includes(searchFilter.location.toLowerCase());
        }

        const newFilteredJobs = jobs.slice().reverse().filter((job) => matchCategory(job) && matchLocation(job) && matchTitle(job) && matchLocationFilter(job));
        setFilteredJobs(newFilteredJobs);
        setCurrentPage(1); // Reset to first page on filter change


    }, [jobs, selectedCategories, selectedLocations, searchFilter]);


    return (
        <div className="max-w-7xl mx-auto mt-10 p-6 bg-white shadow-lg rounded-xl">
            <div className="flex flex-col lg:flex-row gap-10">

                {/* Left Column: Filters */}
                <aside className="w-full lg:w-1/4 flex flex-col gap-8">

                    {/* Category Filter */}
                    <div>
                        <h4 className="text-lg font-semibold mb-4 text-gray-800">Search by Category</h4>
                        <ul className="flex flex-col gap-3">
                            {JobCategories.map((category, index) => (
                                <li key={index}>
                                    <label className="flex items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="h-5 w-5 text-blue-600 rounded accent-blue-600 focus:ring-2 focus:ring-blue-300"
                                            onChange={() => handleCategoryChange(category)}
                                            checked={selectedCategories.includes(category)}
                                        />
                                        <span className="ml-3 text-gray-700 font-medium">{category}</span>
                                    </label>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Location Filter */}
                    <div>
                        <h4 className="text-lg font-semibold mb-4 text-gray-800">Search by Location</h4>
                        <ul className="flex flex-col gap-3">
                            {JobLocations.map((location, index) => (
                                <li key={index}>
                                    <label className="flex items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="h-5 w-5 text-green-600 rounded accent-green-600 focus:ring-2 focus:ring-green-300"
                                            onChange={() => handleLocationChange(location)}
                                            checked={selectedLocations.includes(location)}
                                        />
                                        <span className="ml-3 text-gray-700 font-medium">{location}</span>
                                    </label>
                                </li>
                            ))}
                        </ul>
                    </div>

                </aside>

                {/* Right Column: Job Listings */}
                <main className="w-full lg:w-3/4">

                    {/* Conditional Search Info */}
                    {isSearched ? (
                        (searchFilter.title !== '' || searchFilter.location !== '') ? (
                            <div className="mb-8">
                                <h3 className="text-2xl font-semibold text-gray-800 mb-4">Current Search</h3>
                                <div className="flex flex-wrap gap-3">
                                    {searchFilter.title && (
                                        <span className="flex items-center bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium hover:bg-blue-100 transition">
                                            {searchFilter.title}
                                            <img
                                                onClick={() => setSearchFilter(prev => ({ ...prev, title: '' }))}
                                                src={assets.cross_icon}
                                                alt="remove"
                                                className="ml-2 w-4 h-4 cursor-pointer hover:scale-110 transition-transform"
                                            />
                                        </span>
                                    )}
                                    {searchFilter.location && (
                                        <span className="flex items-center bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm font-medium hover:bg-green-100 transition">
                                            {searchFilter.location}
                                            <img
                                                onClick={() => setSearchFilter(prev => ({ ...prev, location: '' }))}
                                                src={assets.cross_icon}
                                                alt="remove"
                                                className="ml-2 w-4 h-4 cursor-pointer hover:scale-110 transition-transform"
                                            />
                                        </span>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center text-gray-400 mt-12 mb-8">
                                <p className="text-lg font-medium">No search results to display</p>
                            </div>
                        )
                    ) : null}

                    {/* Latest Jobs Section */}
                    <section id="job-list" className="py-10">
                        <h3 className="text-2xl font-semibold text-gray-800 mb-2">Latest Jobs</h3>
                        <p className="text-gray-500 mb-6">Get your desired job at top companies</p>

                        {/* Job Cards Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredJobs.slice((currentPage - 1) * 6, currentPage * 6).map((job, index) => (
                                <JobCard key={job.id || index} job={job} />
                            ))}
                        </div>

                        {/* Pagination */}
                        {filteredJobs.length > 0 && (
                            <div className="flex justify-center items-center mt-10 space-x-3">

                                {/* Previous Button */}
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="p-2 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50"
                                >
                                    <img src={assets.left_arrow_icon} alt="Previous" />
                                </button>

                                {/* Page Numbers */}
                                {Array.from({ length: Math.ceil(filteredJobs.length / 6) }).map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setCurrentPage(index + 1)}
                                        className={`px-4 py-2 rounded-lg transition ${currentPage === index + 1
                                            ? "bg-gray-600 text-white"
                                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                            }`}
                                    >
                                        {index + 1}
                                    </button>
                                ))}

                                {/* Next Button */}
                                <button
                                    onClick={() =>
                                        setCurrentPage(prev => Math.min(prev + 1, Math.ceil(jobs.length / 6)))
                                    }
                                    disabled={currentPage === Math.ceil(jobs.length / 6)}
                                    className="p-2 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50"
                                >
                                    <img src={assets.right_arrow_icon} alt="Next" />
                                </button>
                            </div>
                        )}
                    </section>
                </main>
            </div>
        </div>
    );
};

export default JobListing;