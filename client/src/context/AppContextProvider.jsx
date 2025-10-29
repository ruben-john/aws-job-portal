// AppContextProvider.js
import React, { useEffect } from "react";
import { AppContext } from "./AppContext";
import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth, useUser } from "@clerk/clerk-react";


export const AppContextProvider = ({ children }) => {

    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    const { user } = useUser();
    const { getToken } = useAuth();

    const [searchFilter, setSearchFilter] = useState({
        title: "",
        location: ""
    });

    const [isSearched, setIsSearched] = useState(false)
    const [jobs, setJobs] = useState([])
    const [showRecruiterLogin, setShowRecruiterLogin] = useState(false);
    const [companyToken, setCompanyToken] = useState(null)
    const [companyData, setCompanyData] = useState(null)
    const [userData, setUserData] = useState(null)
    const [userApplications, setUserApplications] = useState([])


    //Function to fetch User Data
    const fetchUserData = async () => {
        try {

            const token = await getToken();
            const { data } = await axios.get(backendUrl + '/api/users/user', { headers: { Authorization: `Bearer ${token}` } });

            if (data.success) {
                setUserData(data.user);
                console.log(data);
            }
            else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error("Error fetching job data:", error);
        }
    }


    //Function to fetch Company Data

    const fetchCompanyData = async () => {
        try {

            const { data } = await axios.get(backendUrl + '/api/company/company', { headers: { token: companyToken } });

            if (data.success) {
                setCompanyData(data.company);
                console.log(data);
            }
            else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error("Error fetching job data:", error);
        }
    }

    //Function to fetch user's applied application data

    const fetchUserApplications = async () => {
        try {

            const token = await getToken();
            const { data } = await axios.get(backendUrl + '/api/users/applications',
                { headers: { Authorization: `Bearer ${token}` } });

            if (data.success) {
                setUserApplications(data.applications); // <-- fix here
            }
            else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error("Error fetching job data:", error);
        }
    }


    //Function to fetch job Data

    const fetchJobs = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/jobs')

            if (data.success) {
                setJobs(data.jobs);
                console.log(data.jobs);
            }
            else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error("Error fetching job data:", error);
        }
    }

    useEffect(() => {
        fetchJobs();
        const storedCompanyToken = localStorage.getItem('companyToken');
        if (storedCompanyToken) {
            setCompanyToken(storedCompanyToken);
        }
    }, []);


    useEffect(() => {

        if (companyToken) {
            fetchCompanyData();
        }
    }, [companyToken]);

    useEffect(() => {

        if (user) {
            fetchUserData();
            fetchUserApplications();
        }
    }, [user]);


    const value = {
        setSearchFilter, searchFilter,
        isSearched, setIsSearched,
        jobs, setJobs,
        showRecruiterLogin, setShowRecruiterLogin,
        companyData, setCompanyData,
        companyToken, setCompanyToken,
        backendUrl,
        userData, setUserData,
        userApplications, setUserApplications,
        fetchUserData,
        fetchUserApplications
    };
    
    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
};