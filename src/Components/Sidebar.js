// src/Components/Sidebar.js

import React, { useContext, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { PermissionContext } from '../Context/PermissionContext';

function Sidebar({ isSidebarOpen, openSubNav, setOpenSubNav }) {
  const { permissionData } = useContext(PermissionContext);
  const role = localStorage.getItem('role');
  const location = useLocation();
  const navigate = useNavigate();

  const toggleSubNav = (subNavId) => {
    setOpenSubNav(openSubNav === subNavId ? "" : subNavId);
  };

  useEffect(() => {
    if (!isSidebarOpen) setOpenSubNav("");
  }, [isSidebarOpen, role]);

  const isActiveRoute = (route) => {
    return location.pathname === route;
  };

  const handleNavigation = (route) => {
    if (location.pathname === route) {
      window.location.reload();
    } else {
      navigate(route);
    }
  };

  return (
    <>
      <div className={`main-sidebar ${isSidebarOpen ? 'open' : ''} ${openSubNav ? 'sub-open' : ''}`}>
        <div className="left-nav">
          <div
            className={`icon first-icon ${isActiveRoute('/') ? 'active' : ''}`}
            onClick={() => handleNavigation('/')}
          >
            <i className="fas fa-chart-line"></i>
            <h6 className="text-center">Dashboard</h6>
          </div>
          <hr className='mx-0 my-0 px-0 py-0' />

          <div className={`icon ${isActiveRoute('/productivity') || location.pathname.startsWith('/productivity/') ? 'active' : ''}`} onClick={() => toggleSubNav("subNav2")}>
            <i className="fas fa-table-cells-large"></i>
            {isSidebarOpen && <h6>Productivity</h6>}
          </div>

          <hr className='mx-0 my-0 px-0 py-0' />

          <div className={`icon ${isActiveRoute('/attendance') || location.pathname.startsWith('/attendance/') ? 'active' : ''}`} onClick={() => toggleSubNav("subNav3")}>
            <i className="fas fa-user-check"></i><h6>Attendance</h6>
          </div>
          <hr className='mx-0 my-0 px-0 py-0' />

          <div className={`icon ${isActiveRoute('/leave') || location.pathname.startsWith('/leave/') ? 'active' : ''}`} onClick={() => toggleSubNav("subNav4")}>
            <i className="fa-regular fa-calendar-days"></i><h6>Leave</h6>
          </div>
          <hr className='mx-0 my-0 px-0 py-0' />

          <div className={`icon ${isActiveRoute('/master') || location.pathname.startsWith('/master/') ? 'active' : ''}`} onClick={() => toggleSubNav("subNav5")}>
            <i className="fas fa-user-tie"></i><h6>Master</h6>
          </div>
          <hr className='mx-0 my-0 px-0 py-0' />

          <div className={`icon ${isActiveRoute('/users') || location.pathname.startsWith('/users/') ? 'active' : ''}`} onClick={() => handleNavigation('/users')}>
            <i className="fas fa-user-group"></i><h6>Users</h6>
          </div>
          <hr className='mx-0 my-0 px-0 py-0' />

          <div className={`icon ${isActiveRoute('/settings') || location.pathname.startsWith('/settings/') ? 'active' : ''}`} onClick={() => handleNavigation('/settings')}>
            <i className="fas fa-gear"></i><h6>Settings</h6>
          </div>

          <hr className='mx-0 my-0 px-0 py-0' />
        </div>
      </div>

      <div className={`sub-sidebar ${openSubNav ? 'open' : ''}`}>
        {openSubNav === "subNav2" && (
          <div className="sub-nav-content">
            <div className={`sub-nav ${openSubNav === "subNav2" ? "active" : ""}`} id="subNav2">
              <div className="sub-item-link" onClick={() => handleNavigation('/productivity/projects')}>
                <h6 className="sub-item">Projects</h6>
              </div>
              <div className="sub-item-link" onClick={() => handleNavigation('/productivity/tasks')}>
                <h6 className="sub-item">Tasks</h6>
              </div>
              <div className="sub-item-link" onClick={() => handleNavigation('/productivity/tasktimer')}>
                <h6 className="sub-item">Tasks Timer</h6>
              </div>
            </div>
          </div>
        )}

        {openSubNav === "subNav3" && (
          <div className="sub-nav-content">
            <div className={`sub-nav ${openSubNav === "subNav3" ? "active" : ""}`} id="subNav3">
              <div className="sub-item-link" onClick={() => handleNavigation('/attendance')}>
                <h6 className="sub-item">Attendance</h6>
              </div>
              <div className="sub-item-link" onClick={() => handleNavigation('/attendance/miss-punch-regularization')}>
                <h6 className="sub-item">Miss Punch Regularization</h6>
              </div>

              {permissionData?.regularization?.canViewRegularization &&
                <div className="sub-item-link" onClick={() => handleNavigation('/attendance/regularization')}>
                  <h6 className="sub-item">Regularization</h6>
                </div>
              }
              {permissionData?.attendanceReport?.canViewAttendanceReport &&
                <div className="sub-item-link" onClick={() => handleNavigation('/attendance/attendancereport')}>
                  <h6 className="sub-item">Monthly Report</h6>
                </div>
              }
            </div>
          </div>
        )}

        {openSubNav === "subNav4" && (
          <div className="sub-nav-content">
            <div className={`sub-nav ${openSubNav === "subNav4" ? "active" : ""}`} id="subNav4">
              <div className="sub-item-link" onClick={() => handleNavigation('/leave')}>
                <h6 className="sub-item">Leave</h6>
              </div>
              {permissionData?.leaveType?.canViewLeaveType &&

                <div className="sub-item-link" onClick={() => handleNavigation('/leave/leavetype')}>
                  <h6 className="sub-item">Leave Type</h6>
                </div>
              }
              {permissionData?.leave?.canViewAllPendingLeave &&
                <div className="sub-item-link" onClick={() => handleNavigation('/leave/pendingleave')}>
                  <h6 className="sub-item">Pending Leave</h6>
                </div>
              }
            </div>
          </div>
        )}

        {openSubNav === "subNav5" && (
          <div className="sub-nav-content">
            <div className={`sub-nav ${openSubNav === "subNav5" ? "active" : ""}`} id="subNav5">
              <div className="sub-item-link" onClick={() => handleNavigation('/master/holidays')}>
                <h6 className="sub-item">Holidays</h6>
              </div>
              <div className="sub-item-link" onClick={() => handleNavigation('/master/weekoff')}>
                <h6 className="sub-item">Week Off</h6>
              </div>
              {permissionData?.locationMaster?.canViewLocationMaster &&
                <div className="sub-item-link" onClick={() => handleNavigation('/master/location-master')}>
                  <h6 className="sub-item">Location Master</h6>
                </div>
              }
              {permissionData?.userSalary?.canViewUserSalary &&
                <div className="sub-item-link" onClick={() => handleNavigation('/master/user-salary')}>
                  <h6 className="sub-item">User Salary</h6>
                </div>
              }
              {permissionData?.payRoll?.canViewPayRoll &&
                <div className="sub-item-link" onClick={() => handleNavigation('/master/payroll')}>
                  <h6 className="sub-item">Pay Roll Report</h6>
                </div>
              }
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default Sidebar;