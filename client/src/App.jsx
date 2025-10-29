import './App.css'
import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home.jsx'
import ApplyJob from './pages/ApplyJob.jsx'
import Applications from './pages/Applications.jsx'
import RecruiterLogin from './components/RecruiterLogin.jsx'
import { useContext } from 'react'
import { AppContext } from './context/AppContext.jsx'
import Dashboard from './pages/Dashboard.jsx'
import ManageJobs from './pages/ManageJobs.jsx'
import AddJob from './pages/AddJob.jsx'
import ViewApplications from './pages/ViewApplications.jsx'
import RankedApplicantsPage from './pages/RankedApplicants.jsx'
import 'quill/dist/quill.snow.css'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

function App() {
  const { showRecruiterLogin ,companyToken} = useContext(AppContext);
  return (
    <>
      <div>
        {showRecruiterLogin && <RecruiterLogin />}
         <ToastContainer />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/apply-job/:id" element={<ApplyJob />} />
          <Route path="/applications" element={<Applications />} />

          {/* Dashboard with nested routes */}
          <Route path="/dashboard" element={<Dashboard />}>
          {companyToken?<>  
            <Route path="add-job" element={<AddJob />} />
            <Route path="manage-jobs" element={<ManageJobs />} />
            <Route path="view-applications" element={<ViewApplications />} />
            <Route path="ranked-applicants/:jobId" element={<RankedApplicantsPage />} />
          </>:null
          }
          </Route>
        </Routes>
      </div>
    </>
  )
}

export default App
