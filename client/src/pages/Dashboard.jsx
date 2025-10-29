import React from 'react'
import { assets } from '../assets/assets'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { useEffect } from 'react';
const Dashboard = () => {
    const navigate = useNavigate();

    const { companyData ,setCompanyData,setCompanyToken} = useContext(AppContext);

    const logout=()=>{
        setCompanyData(null);
        localStorage.removeItem('companyToken');
        setCompanyToken(null);
        navigate('/');

    }

    useEffect(() => {
        if(companyData){
            navigate('/dashboard/manage-jobs')
        }
    }, [companyData])
    

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            {/* Navbar */}
            <div className="bg-white shadow-md px-6 py-4 flex justify-between items-center">
                {/* Logo */}
                <img
                    onClick={() => navigate('/')}
                    src={assets.logo}
                    alt="Logo"
                    className="h-10 cursor-pointer"
                />

                {/* User Info */}

                {companyData && (
                    <div className="relative group">
                        <div className="flex items-center cursor-pointer">
                            <p className="text-gray-700 font-medium mr-2">Welcome ,{companyData.name}</p>
                            <img
                                src={companyData.image}
                                alt="Company"
                                className="h-10 w-10 rounded-full border border-gray-300"
                            />
                        </div>

                        {/* Dropdown */}
                        <div className="absolute right-0 mt-2 w-32 bg-white shadow-lg rounded-md opacity-0 invisible group-hover:visible group-hover:opacity-100 transition-all duration-200 z-10">
                            <ul className="py-2 text-gray-700">
                                <li
                                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                    onClick={logout} // Replace with logout logic
                                >
                                    Logout
                                </li>
                            </ul>
                        </div>
                    </div>
                )}

            </div>

            {/* Sidebar + Content below navbar */}
            <div className="flex flex-1 mt-6 w-full">
                {/* Sidebar */}
                <div className="w-60 bg-white shadow-md rounded-xl p-4 flex-shrink-0 mr-6">
                    <ul className="space-y-4">
                        <NavLink
                            to={"add-job"}
                            className={({ isActive }) =>
                                `flex items-center space-x-3 p-2 rounded-md hover:bg-gray-100 ${isActive ? 'bg-gray-200 font-semibold' : ''
                                }`
                            }
                        >
                            <img src={assets.add_icon} alt="" className="h-6 w-6" />
                            <p>Add Job</p>
                        </NavLink>

                        <NavLink
                            to={"manage-jobs"}
                            className={({ isActive }) =>
                                `flex items-center space-x-3 p-2 rounded-md hover:bg-gray-100 ${isActive ? 'bg-gray-200 font-semibold' : ''
                                }`
                            }
                        >
                            <img src={assets.home_icon} alt="" className="h-6 w-6" />
                            <p>Manage Jobs</p>
                        </NavLink>

                        <NavLink
                            to={'view-applications'}
                            className={({ isActive }) =>
                                `flex items-center space-x-3 p-2 rounded-md hover:bg-gray-100 ${isActive ? 'bg-gray-200 font-semibold' : ''
                                }`
                            }
                        >
                            <img src={assets.person_tick_icon} alt="" className="h-6 w-6" />
                            <p>View Applications</p>
                        </NavLink>
                    </ul>
                </div>

                {/* Main Content */}
                <div className="flex-1 bg-white shadow-md rounded-xl p-6">
                    <Outlet />
                </div>
            </div>
        </div>
    )
}

export default Dashboard