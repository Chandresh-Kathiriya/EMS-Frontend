// src/Pages/Dashboard.js
// Hello 123456

// Import core module
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';

// Import require components
import Layout from '../Components/Layout';
import DataTable from '../Components/DataTable';

import { fetchDashboardData, fetchAttendanceData, fetchPendingTasksData } from '../redux/actions/dashboardActions';

function Dashboard() {
  const dispatch = useDispatch();
  // const { permissionData } = useContext(PermissionContext);
  const token = localStorage.getItem('token');
  // if (!token) {
  //   window.location.href = '/login';
  // }

  const { totalProjects, ongoingTasks, dueTodayTasks, overdueTasks, attendanceData, pendingTasksData} = useSelector(
    (state) => state.dashboard
  );

  const role = localStorage.getItem('role');
  const userId = localStorage.getItem('id');
  const [word, setWord] = useState('Hello')

  useEffect(() => {
    let user = null;
    if (role !== 'Admin') {
      user = userId
    }
    dispatch(fetchDashboardData(token, user));
    dispatch(fetchAttendanceData(token, role, userId));
    dispatch(fetchPendingTasksData(token, role, userId));
  }, [dispatch, token, role, userId]);


  function formatTime(dateInput) {
    const date = new Date(dateInput);
    return date.toTimeString().slice(0, 8); // HH:MM:SS
  }

  function formatDuration(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
    const minutes = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
    const seconds = (totalSeconds % 60).toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  }

  function calculateLogHours(records) {
    if (!records || records.length === 0) return null;

    const sortedRecords = [...records].sort((a, b) => new Date(a.time) - new Date(b.time));
    let totalMs = 0;

    for (let i = 0; i < sortedRecords.length; i += 2) {
      const timeIn = new Date(sortedRecords[i].time);
      const timeOut = sortedRecords[i + 1] ? new Date(sortedRecords[i + 1].time) : new Date();
      totalMs += timeOut - timeIn;
    }

    return {
      userId: sortedRecords[0].userId,
      name: sortedRecords[0].name,
      time: formatTime(sortedRecords[0].time),
      logHours: formatDuration(totalMs)
    };
  }

  function formatAttendanceData(data) {
    if (!Array.isArray(data) || data.length === 0) return [];

    const isAdminFormat = data[0] && typeof data[0] === 'object' && Array.isArray(data[0].records);

    if (isAdminFormat) {
      // Admin format
      return data
        .filter(user => Array.isArray(user.records) && user.records.length > 0)
        .map(user => calculateLogHours(user.records));
    } else {
      // User format - always return in an array
      const result = calculateLogHours(data);
      return result ? [result] : [];
    }
  }

  const attendanceColumns = [
    { Header: 'User', accessor: 'name', sortable: true },
    { Header: 'Time In', accessor: 'time', sortable: true },
    { Header: 'Work Time', accessor: 'logHours', sortable: true }, // logHours for time remaining
  ];

  const pendingTasksColumns = [
    { Header: 'Code', accessor: 'code', sortable: true },
    { Header: 'Task Name', accessor: 'name', sortable: true },
    { Header: 'Project', accessor: 'projectName', sortable: true },
    { Header: 'End Date', accessor: 'endDate', sortable: true },
    { Header: 'Status', accessor: 'status', sortable: true },
  ];

  return (
    <>
      <Layout>
        <section className="section dashboard">
          <div className="row">
            <div className="col-lg-12">
              <div className="pagetitle my-2">
                <h1>Overview {word}</h1>
              </div>
              <div className="row">
                <div className="col-lg-3 col-md-6">
                  <div className="card info-card total-projects-card">
                    <div className="card-body py-0">
                      <h5 className="card-title">Total Projects</h5>
                      <div className="d-flex align-items-center">
                        <div className="card-icon rounded-circle d-flex align-items-center justify-content-center">
                          <i className="fas fa-tasks"></i>
                        </div>
                        <div className="ps-3">
                          <h6>{totalProjects}</h6>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-lg-3 col-md-6">
                  <div className="card info-card ongoing-tasks-card">
                    <div className="card-body py-0">
                      <h5 className="card-title">On Going Tasks</h5>
                      <div className="d-flex align-items-center">
                        <div className="card-icon rounded-circle d-flex align-items-center justify-content-center">
                          <i className="fas fa-bars-progress"></i>
                        </div>
                        <div className="ps-3">
                          <h6>{ongoingTasks}</h6>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-lg-3 col-md-6">
                  <div className="card info-card due-today-card">
                    <div className="card-body py-0">
                      <h5 className="card-title">Due Today Task</h5>
                      <div className="d-flex align-items-center">
                        <div className="card-icon rounded-circle d-flex align-items-center justify-content-center">
                          <i className="fas fa-spinner"></i>
                        </div>
                        <div className="ps-3">
                          <h6>{dueTodayTasks}</h6>
                          {/* Due tasks data will go here */}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-lg-3 col-md-6">
                  <div className="card info-card overdue-tasks-card">
                    <div className="card-body py-0">
                      <h5 className="card-title">Over Due Task</h5>
                      <div className="d-flex align-items-center">
                        <div className="card-icon rounded-circle d-flex align-items-center justify-content-center">
                          <i className="fas fa-circle-exclamation"></i>
                        </div>
                        <div className="ps-3">
                          <h6>{overdueTasks}</h6>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className='row mt-4'>
            <div className="col-lg-12">
              <div className="row">
                {attendanceData?.data?.length > 0 &&
                  <>
                    <div className="col-md-5">
                      <div className="pagetitle my-2">
                        <h1>Log Time</h1>
                      </div>
                      <DataTable columns={attendanceColumns} data={formatAttendanceData(attendanceData?.data)} footer={false} />
                    </div>
                  </>
                }
                {pendingTasksData.length > 0 && (
                  <>
                    <div className={attendanceData.data.length === 0 ? "col-md-12" : "col-md-7"}>
                      <div className="pagetitle my-2">
                        <h1>Pending Tasks</h1>
                      </div>
                      <DataTable
                        columns={pendingTasksColumns}
                        data={role === 'Admin' ? pendingTasksData : pendingTasksData.filter(task => task.createdBy == userId)}
                        footer={false}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>

      </Layout>
    </>
  );
}

export default Dashboard;