// Import required components
import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { PermissionProvider, PermissionContext } from './Context/PermissionContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ProtectedRoute from './Components/ProtectedRoute';

// Import css files
import './css/bootstrap.min.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './css/bootstrap-icons.css';
import './css/fonts.css';
import './css/style2.css';
import './css/datatables.css';

// Import Pages
import Dashboard from './Pages/Dashboard';
import Profile from './Pages/Profile';
import Login from './Pages/Login';
import Settings from './Pages/Settings';

import Users from './Pages/Users';
import ManageRoles from './Pages/ManageRoles';

import Attendance from './Pages/Attendance';
import Projects from './Pages/Projects/Projects';
// import Projects from './Pages/Projects';
import Tasks from './Pages/Tasks';
import TaskTimer from './Pages/TaskTimer';
import MissPunchRegularization from './Pages/MissPunchRegularization';

import Leave from './Pages/Leave';
import LeaveType from './Pages/LeaveType';
import PendingLeave from './Pages/PendingLeave';

import Holiday from './Pages/Holiday';
import WeekOff from './Pages/WeekOff';
import LocationMaster from './Pages/LocationMaster';
import PayRoll from './Pages/PayRoll';
import UserSalary from './Pages/UserSalary';

import AddTask from './Pages/AddTask';
import Regularization from './Pages/Regularization';
import AttendanceReport from './Pages/AttendanceReport';
import NotFound404 from './Pages/NotFound404';
import ProjectsDetails from './Pages/ProjectsDetails';
import NewRole from './Pages/NewRole';
import ResetPassword from './Pages/ResetPassword';
import VerifyPassword from './Pages/VerifyPassword';


function App() {
  return (
    <PermissionProvider>
      <AppRoutes />
    </PermissionProvider>
  );
}

function AppRoutes() {
  const { permissionData } = useContext(PermissionContext);

  return (
    <Router>
      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/reset-password/:token" element={<VerifyPassword />} />

        {/* Main Routes */}
        <Route path="/" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />

        {/* User Management */}
        <Route path="/users" element={<Users />} />
        <Route path="/users/manageroles" element={<ProtectedRoute element={<ManageRoles />} />} />
        <Route path="/users/newrole" element={<ProtectedRoute element={<NewRole />} />} />
        <Route path="/users/editrole/:encryptedRoleID" element={<ProtectedRoute element={<NewRole />} />} />

        {/* Leave */}
        <Route path="/leave" element={<Leave />} />
        {permissionData?.leaveType?.canViewLeaveType &&
          <Route path="/leave/leavetype" element={<ProtectedRoute element={<LeaveType />} />} />}
        {permissionData?.leave?.canViewAllPendingLeave &&
          <Route path="/leave/pendingleave" element={<ProtectedRoute element={<PendingLeave />} />} />}

        {/* Productivity */}
        <Route path="/productivity/projects" element={<Projects />} />
        <Route path="/productivity/projects/details/:encryptedProjectID" element={<ProjectsDetails />} />
        <Route path="/productivity/tasks" element={<Tasks />} />
        <Route path="/productivity/tasks/:taskId" element={<AddTask />} />
        <Route path="/productivity/tasktimer" element={<TaskTimer />} />

        {/* Attendance */}
        <Route path="/attendance" element={<Attendance />} />
        <Route path="/attendance/miss-punch-regularization" element={<MissPunchRegularization />} />
        {permissionData?.regularization?.canViewRegularization &&
          <Route path="/attendance/regularization" element={<ProtectedRoute element={<Regularization />} />} />}
        {permissionData?.attendanceReport?.canViewAttendanceReport &&
          <Route path="/attendance/attendancereport" element={<ProtectedRoute element={<AttendanceReport />} />} />}

        {/* Master Data */}
        <Route path="/master/holidays" element={<Holiday />} />
        <Route path="/master/weekoff" element={<WeekOff />} />
        {permissionData?.locationMaster?.canViewLocationMaster &&
          <Route path="/master/location-master" element={<ProtectedRoute element={<LocationMaster />} />} />}
        {permissionData?.payRoll?.canViewPayRoll &&
          <Route path="/master/payroll" element={<ProtectedRoute element={<PayRoll />} />} />}
        {permissionData?.userSalary?.canViewUserSalary &&
          <Route path="/master/user-salary" element={<ProtectedRoute element={<UserSalary />} />} />}

        {/* Catch-all */}
        {/* <Route path="*" element={<NotFound404 />} /> */}
      </Routes>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </Router>
  );
}


export default App;