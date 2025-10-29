import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../context/AppContext';
import axios from 'axios'
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const RecruiterLogin = () => {

  const navigate = useNavigate();

  const [state, setState] = useState('Login'); // "Login" or "Register"
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [image, setImage] = useState(null);
  const [isTextDataSubmitted, setIsTextDataSubmitted] = useState(false);
  const { setShowRecruiterLogin, backendUrl, setCompanyToken, setCompanyData } = useContext(AppContext);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) setImage(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsTextDataSubmitted(true);

    console.log('Form Data:', {
      state,
      name,
      email,
      password,
      image,
    });

    try {
      
      if(state==='Login'){
        const { data } = await axios.post(backendUrl + '/api/company/login', { email, password });

      if (data.success) {
        toast.success('Login successful!');
        setCompanyData(data.company);
        setCompanyToken(data.token);
        localStorage.setItem('companyToken', data.token);
        setShowRecruiterLogin(false);
        navigate('/dashboard');
      } else {
        toast.error(data.message); // in case API sends 200 but success=false
      }
    }
    else{
      const formData=new FormData();
      formData.append('name',name)
      formData.append('email',email)
      formData.append('password',password)
      formData.append('image',image)

      const { data } = await axios.post(backendUrl + '/api/company/register', formData);

      if (data.success) {
        toast.success('Login successful!');
        setCompanyData(data.company);
        setCompanyToken(data.token);
        localStorage.setItem('companyToken', data.token);
        setShowRecruiterLogin(false);
        navigate('/dashboard');
      } else {
        toast.error(data.message); // in case API sends 200 but success=false
      }
    }
    } catch (error) {
      console.log(error);

      // ✅ show toast for Axios error
      if (error.response && error.response.data && error.response.data.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Something went wrong. Please try again.');
      }
    }

    setTimeout(() => {
      setIsTextDataSubmitted(false);
    }, 2000);
  };

  const handleForgotPassword = () => {
    alert('Forgot Password feature coming soon!');
    // Replace with navigation or modal logic if needed
  };

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);


  return (
    <div className="fixed inset-0 bg-blue-600/30 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 relative">

        {/* Close button */}
        <button
          onClick={() => setShowRecruiterLogin(false)}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl font-bold"
        >
          ×
        </button>

        <h2 className="text-2xl font-semibold text-center mb-6 text-gray-800">
          {state === 'Login' ? 'Recruiter Login' : 'Recruiter Register'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {state === 'Register' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company Logo / Profile Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                />
                {image && (
                  <p className="text-sm text-green-600 mt-1">
                    Uploaded: {image.name}
                  </p>
                )}
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Forgot Password (only in Login mode) */}
          {state === 'Login' && (
            <div className="text-right">
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-sm text-blue-600 hover:underline focus:outline-none"
              >
                Forgot Password?
              </button>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg shadow-md hover:bg-blue-700 transition-all duration-200"
          >
            {isTextDataSubmitted
              ? state === 'Login'
                ? 'Logging in...'
                : 'Registering...'
              : state === 'Login'
                ? 'Login'
                : 'Register'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-4">
          {state === 'Login' ? (
            <>
              Don’t have an account?{' '}
              <span
                onClick={() => setState('Register')}
                className="text-blue-600 cursor-pointer hover:underline"
              >
                Register here
              </span>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <span
                onClick={() => setState('Login')}
                className="text-blue-600 cursor-pointer hover:underline"
              >
                Login
              </span>
            </>
          )}
        </p>
      </div>
    </div>
  );
};

export default RecruiterLogin;