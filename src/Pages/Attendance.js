// src/Pages/Attendance.js

// Import core modules
import React, { useState, useEffect, useRef, useContext } from 'react';
import { toast } from 'react-toastify';
import { useSelector, useDispatch } from 'react-redux';

// Importing important components for page
import Layout from '../Components/Layout';
import DataTable from '../Components/DataTable';
import OffCanvas from '../Components/OffCanvas';
import FilterOffCanvas from '../Components/FilterOffCanvas';
import { apiCall } from '../Components/API';
import SelectInput from '../Components/SelectInput';
import Punch from '../Components/Punch';
import { ModalComponent } from '../Components/Model';


import { PermissionContext } from '../Context/PermissionContext';

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import { fetchAttendanceData, fetchUserData, fetchExportAttendanceData } from '../redux/actions/attendanceActions';

function Attendance() {
  const { permissionData } = useContext(PermissionContext);
  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const [showFilterOffcanvas, setShowFilterOffcanvas] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalBody, setModalBody] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingAttendanceId, setEditingAttendanceId] = useState(null);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [period, setPeriod] = useState('AM');
  const [reason, setReason] = useState('');
  const [remarks, setRemarks] = useState('');
  const [attendanceDate, setAttendanceDate] = useState('');
  const [attendanceUser, setAttendanceUser] = useState('');
  const [timeIn, setTimeIn] = useState('');
  const [timeOut, setTimeOut] = useState('');
  const [per_page, setPer_page] = useState(10)
  const [page, setPage] = useState(1)
  const [total_page, setTotal_page] = useState('')

  // Check token is available in localstorage
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  let user = localStorage.getItem('id');

  // Redirect to login if token is not available
  // if (!token) {
  //   toast.error('You must be logged in to view this page');
  //   window.location.href = '/login';
  // }

  const today = new Date(),
    currentDate = today.getFullYear() + '-' + ("0" + (today.getMonth() + 1)).slice(-2) + '-' + ("0" + today.getDate()).slice(-2);

  const initialFilter = () => {
    try {
      const attendance = localStorage.getItem('attendanceFilter');
      return attendance ? JSON.parse(attendance) : {};
    } catch (error) {
      console.error('Error parsing attendanceFilter:', error);
      return {};
    }
  };

  const [filters, setFilters] = useState(() => {
    const init = initialFilter();
    const today = new Date().toISOString().split('T')[0]; // 'YYYY-MM-DD' 
    return {
      user: init?.user || null,
      fromDate: today,
      toDate: today
    };
  });
  const bgFilter = Object.values(filters).some(value => value != null && value !== '');

  const handlePreviousClick = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const handleNextClick = () => {
    if (page < total_page) {
      setPage(page + 1);
    }
  };

  const handlePageSizeChange = (newSize) => {
    setPer_page(newSize);
    setPage(1); // Reset to first page when changing size
  };

  const dispatch = useDispatch();
  const { attendanceData, userData, exportAttendance } = useSelector(
    (state) => state.attendance
  );


  useEffect(() => {
    // Don't mutate props or variables directly
    const userForParams = role === 'Admin' ? null : user;

    const baseParams = {
      user: userForParams,
      filterUser: filters.user,
      fromDate: filters.fromDate,
      toDate: filters.toDate
    };

    if (token) {
      const attendanceParams = {
        ...baseParams,
        per_page,
        page
      };
      dispatch(fetchAttendanceData(token, attendanceParams));
      dispatch(fetchUserData(token));
    }

    dispatch(fetchExportAttendanceData(token, baseParams));
  }, [token, per_page, page, user, role, dispatch, filters]);

  useEffect(() => {
    if (attendanceData?.data) {
      sortAttendanceData();
    } else {
      setAttendance([])
    }
    if (attendanceData.pagination) {
      setPage(attendanceData.pagination.page);
      setPer_page(attendanceData.pagination.per_page);
      setTotal_page(attendanceData.pagination.total_pages);
    }
  }, [attendanceData.data, attendanceData.pagination, filters]);

  const cameraRef = useRef(null);
  const handleAttendanceButtonClick = () => {
    if (cameraRef.current) {
      cameraRef.current.click(); // Trigger the click on the camera icon
    }
  };

  const formatTime = (isoString) => {
    if (!isoString) return '';
    return new Date(isoString).toLocaleTimeString('en-GB', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  function formatTimeForLog(timeStr) {
    if (!timeStr) return '00:00:00';

    if (timeStr.includes('T')) {
      return timeStr.split('T')[1].split('.')[0];
    }

    if (timeStr.includes(' ')) {
      return timeStr.split(' ')[1];
    }

    return timeStr; // Already in HH:MM:SS
  }

  function calculateTotalLogHours(logs) {
    if (!Array.isArray(logs) || logs.length === 0) return '00:00:00';

    // Sort by time ascending
    const sortedLogs = logs.slice().sort((a, b) => {
      const timeA = formatTimeForLog(a.time);
      const timeB = formatTimeForLog(b.time);
      return new Date(`1970-01-01T${timeA}`) - new Date(`1970-01-01T${timeB}`);
    });

    // const currentTimeISO = new Date().toISOString();

    const now = new Date();
    const todayDate = now.toISOString().split('T')[0];  // '2025-04-14'
    const currentTimeISO = now.toISOString();

    if (sortedLogs.length % 2 !== 0) {
      const logDate = sortedLogs[0]?.date || ''; // Assume the date is part of each log

      // Check if the date is today's date
      const timeToUse = logDate === todayDate ? currentTimeISO : sortedLogs[sortedLogs.length - 1].time;

      // Add the time for the unmatched log (as the "log-out" time)
      sortedLogs.push({ time: timeToUse });
    }

    let totalSeconds = 0;

    for (let i = 0; i < sortedLogs.length; i += 2) {
      const timeIn = formatTimeForLog(sortedLogs[i].time);
      const timeOut = formatTimeForLog(sortedLogs[i + 1].time);

      const [inH, inM, inS] = timeIn.split(':').map(Number);
      const [outH, outM, outS] = timeOut.split(':').map(Number);

      const inSec = inH * 3600 + inM * 60 + inS;
      const outSec = outH * 3600 + outM * 60 + outS;

      let diff = outSec - inSec;
      if (diff < 0) diff += 24 * 3600;

      totalSeconds += diff;
    }

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  const sortAttendanceData = () => {
    try {
      const data = attendanceData.data;

      const preparedData = [];
      const dataForUser = [];

      const now = new Date();
      const todayDate = now.toISOString().split('T')[0];
      const currentTimeISO = now.toISOString();

      Object.entries(data).forEach(([date, users]) => {
        Object.entries(users).forEach(([userId, logs]) => {
          if (!Array.isArray(logs) || logs.length === 0) return;

          const firstLog = logs[0];
          const lastLog = logs[logs.length - 1];

          const rawTimeIn = lastLog.time;
          let rawTimeOut = firstLog.time;

          // Handling missing log out time if logs length is odd
          if (logs.length % 2 !== 0) {
            const logDate = firstLog?.date || '';
            if (logDate === todayDate) {
              rawTimeOut = currentTimeISO;
            } else {
              const fallbackTime = new Date();
              fallbackTime.setHours(19, 0, 0, 0); // local 7:00 PM
              rawTimeOut = fallbackTime;
            }
          }

          const timeIn = formatTime(rawTimeIn);
          const timeOut = formatTime(rawTimeOut);

          const fullName = firstLog?.User?.full_name || '';
          const date = firstLog?.date || '';
          const userIdForAttendance = firstLog?.userId || '';
          const latitude = lastLog?.latitude || '';
          const longitude = lastLog?.longitude || '';
          const imageURL = lastLog?.imageURL || '';
          const logHours = calculateTotalLogHours(logs);

          // Handle regularization data as an array (if multiple regularization records exist)
          const regularization = users?.regularization || [];

          const expandData = logs.map(log => ({
            imageURL: log.imageURL,
            time: formatTime(log.time),
            latitude: log.latitude,
            longitude: log.longitude,
          }));

          // User log object
          const userLog = {
            userIdForAttendance,
            fullName,
            date,
            timeIn,
            timeOut,
            logHours,
            latitude,
            longitude,
            imageURL,
            expandData,
            regularization: regularization // Use filtered regularization
          };

          // If user log for the same date already exists, update it (avoid duplication)
          const existingLogIndex = preparedData.findIndex(log => log.userIdForAttendance === userIdForAttendance && log.date === date);
          if (existingLogIndex === -1) {
            // No existing log found, add the new user log
            preparedData.push(userLog);
          } else {
            // If log exists, update the existing log's regularization data (only add unique items)
            regularization.forEach(item => {
              const existingRegularizationIndex = preparedData[existingLogIndex].regularization.findIndex(r => r.reason === item.reason);
              if (existingRegularizationIndex === -1) {
                preparedData[existingLogIndex].regularization.push(item);
              }
            });
          }

          // Collect data for the specific user
          if (userIdForAttendance == user) {
            const existingUserLogIndex = dataForUser.findIndex(log => log.userIdForAttendance === userIdForAttendance && log.date === date);
            if (existingUserLogIndex === -1) {
              dataForUser.push(userLog);
            }
          }
        });
      });

      // Admin or specific user data handling
      if (role === 'Admin') {
        setAttendance(preparedData);
      } else {
        setAttendance(dataForUser);
      }
    } catch (error) {
      toast.error('Failed to fetch users');
      console.error(error);
    }
  };


  useEffect(() => {
    // Only store the user value in localStorage
    localStorage.setItem('attendanceFilter', JSON.stringify({ user: filters.user }));
  }, [filters.user]);

  // Columns definition for the DataTable
  const columns = [
    { Header: 'Image', accessor: 'imageURL' },
    { Header: 'User', accessor: 'fullName' },
    { Header: 'Date', accessor: 'date' },
    { Header: 'Time In', accessor: 'timeIn' },
    { Header: 'Time Out', accessor: 'timeOut' },
    { Header: 'Log Hours', accessor: 'logHours' },
    { Header: 'Location', accessor: 'location' },
  ];

  // Columns definition for the DataTable
  const expandColumns = [
    { Header: 'Image', accessor: 'imageURL' },
    { Header: 'Time', accessor: 'time' },
    { Header: 'Location', accessor: 'location' },
  ];

  // Show filter offcanvas
  const handleFilterClick = () => {
    setShowFilterOffcanvas(true);
  };

  // Save edited attendance logic
  const handleSaveEditAttendance = async () => {
    let errors = {
      attendanceDate: !attendanceDate,
      attendanceUser: !attendanceUser,
      reason: !reason,
      remarks: !remarks,
    };

    if (Object.values(errors).includes(true)) {
      toast.error('Please fill all required fields');
      return;
    }
    let hourForRegularization = hours;
    if (period === 'PM') {
      hourForRegularization += 12;
    }
    const formData = {
      attendanceDate,
      attendanceUser,
      time: hourForRegularization + ':' + minutes,
      reason,
      remarks
    }
    const response = await apiCall('attendance/createRegularization', token, 'POST', formData);
    if (response) {
      toast.success('Regularization created Successfully');
      setShowOffcanvas(false); // Close offcanvas
    }
  };

  // Handle export button click
  const handleExportClick = () => {

    if (exportAttendance?.data?.length === 0) {
      toast.error('No data available to export');
      return;
    }

    exportToCSV(exportAttendance?.data);
    toast.success('Exporting data as CSV!');
  };

  // Export data to CSV logic
  const exportToCSV = (data) => {
    if (!Array.isArray(data) || data.length === 0 || typeof data[0] !== 'object') {
      console.error('Invalid or empty data provided to export.');
      return;
    }

    const headers = Object.keys(data[0]);
    const updatedAtIndex = headers.indexOf('longitude');
    const filteredHeaders = updatedAtIndex !== -1 ? headers.slice(0, updatedAtIndex + 1) : headers;

    const rows = data
      .filter(item => item && typeof item === 'object') // Filter out any invalid entries
      .map(item => filteredHeaders.map(header => item[header] ?? '').join(',')); // Avoid undefined fields

    const csvContent = [filteredHeaders.join(','), ...rows].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'attendance.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleEditAttendance = (attendance) => {
    setAttendanceDate(attendance.date || new Date());
    if (attendance.userIdForAttendance !== undefined) {
      setAttendanceUser(attendance.userIdForAttendance || '');
    } else {
      if (role === 'Admin') {
        setAttendanceUser('')
      } else {
        setAttendanceUser(user)
      }
    }
    setHours(attendance.hours || 0);
    setMinutes(attendance.minutes || 0);
    setPeriod(attendance.period || 'AM');
    setReason(attendance.reason || '');
    setRemarks(attendance.remarks || '');
    setTimeIn(attendance.timeIn || '');
    setTimeOut(attendance.timeOut || '');
    setIsEditing(true);
    setEditingAttendanceId(attendance.id);
    setShowOffcanvas(true);
  };

  const handleInfoClick = (attendance) => {
    setModalBody(attendance)
    setShowModal(true);
  }

  // Handlers for input changes
  const handleInputChange = (setter) => (event) => {
    setter(event.target.value);
  };

  const getSelectedUser = () => {
    const user = userData?.data?.find(u => u.id === filters.user);
    return user ? { value: user.id, label: user.full_name } : null;
  };

  const handleResetFilter = () => {
    setFilters({
      user: null,
      fromDate: '',
      toDate: '',
    })
  };

  const handleFilterUpdate = (value, filterName, type = 'default') => {
    let processedValue;

    if (type === 'date') {
      if (value) {
        const year = value.getFullYear();
        const month = String(value.getMonth() + 1).padStart(2, '0');
        const day = String(value.getDate()).padStart(2, '0');
        processedValue = `${year}-${month}-${day}`;
      } else {
        processedValue = '';
      }
    } else {
      // For select options or other types
      processedValue = value ? value : null;
    }

    setFilters(prev => ({
      ...prev,
      [filterName]: processedValue
    }));
  };

  const handleInputChangeHours = (setter) => (e) => {
    let value = Number(e.target.value);

    // Ensure the value is within bounds (0 to 12)
    if (value < 0) value = 0;
    if (value > 12) value = 12;

    setter(value);
  };

  const handleInputChangeMinutes = (setter) => (e) => {
    let value = Number(e.target.value);

    // Ensure the value is within bounds (0 to 59)
    if (value < 0) value = 0;
    if (value > 59) value = 59;

    setter(value);
  };


  // Offcanvas content for different modes (filter, new, edit)
  const offcanvasContent = {
    filter: (
      <>
        <div className='col-lg-12'>
          {role === 'Admin' &&
            <div className="form-group">
              <label>User</label>
              <SelectInput
                placeholder={'Select User'}
                value={getSelectedUser()}
                onChange={(option) => handleFilterUpdate(option?.value ? option.value : null, 'user')}
                options={userData?.data?.map((user) => ({
                  value: user.id,
                  label: user.full_name
                }))}
              />
            </div>
          }
          <div className='col-lg-12 mt-2'>
            <div className='col-md-12'>
              <label>From</label>
              <div className='form-control'>
                <DatePicker
                  className='reactdatePicker'
                  selected={filters.fromDate ? new Date(filters.fromDate) : null}
                  onChange={(date) => handleFilterUpdate(date, 'fromDate', 'date')}
                  dateFormat="dd/MM/yyyy"
                  placeholderText="DD/MM/YYYY"
                  isClearable
                  clearButtonClassName='m-0 p-0 mx-5'
                />
              </div>
            </div>

            <div className='col-md-12 mt-2'>
              <label>To</label>
              <div className='form-control'>
                <DatePicker
                  className='reactdatePicker'
                  selected={filters.toDate ? new Date(filters.toDate) : null}
                  onChange={(date) => handleFilterUpdate(date, 'toDate', 'date')}
                  dateFormat="dd/MM/yyyy"
                  placeholderText="DD/MM/YYYY"
                  isClearable
                  clearButtonClassName='m-0 p-0 mx-5'
                />
              </div>
            </div>
          </div>
        </div>
      </>
    ),
    regularization: (
      <>
        <form>
          <div className="offcanvas-body">
            {attendanceDate && timeIn && timeOut &&
              <>
                <div className="d-flex col-lg-12">
                  <h6 className="mx-1 col-md-4" style={{ color: 'black' }}>Date</h6>
                  <h6 className="mx-1 col-md-4" style={{ color: 'black' }}>Log In</h6>
                  <h6 className="mx-1 col-md-4" style={{ color: 'black' }}>Last Login</h6>
                </div>
                <div className="d-flex mb-3 col-lg-12">
                  <h6 className="mx-1 col-md-4" style={{ color: 'black' }}>{attendanceDate}</h6>
                  <h6 className="mx-1 col-md-4" style={{ color: 'black' }}>{timeIn}</h6>
                  <h6 className="mx-1 col-md-4" style={{ color: 'black' }}>{timeOut}</h6>
                </div>
              </>
            }
            {!timeIn && !timeOut &&
              <>
                <div className='col-lg-12 d-flex'>
                  <div className='col-md-6 mb-3 px-1'>
                    <label>Date</label>
                    <div className='form-control'>
                      <DatePicker
                        className='reactdatePicker'
                        selected={attendanceDate || ''}
                        onChange={(date) => setAttendanceDate(date)}
                        dateFormat="dd/MM/yyyy"
                        placeholderText="DD/MM/YYYY"
                        isClearable
                        clearButtonClassName='m-0 p-0 mx-5'
                      />
                    </div>
                  </div>
                  {role === 'Admin' &&
                    <div className="form-group col-md-6 px-1">
                      <label>User</label>
                      <SelectInput
                        placeholder={'Select User'}
                        value={
                          userData?.data?.find(user => user.id === attendanceUser)
                            ? {
                              value: attendanceUser,
                              label: userData.data.find(user => user.id === attendanceUser)?.full_name
                            }
                            : null
                        }
                        onChange={(option) => setAttendanceUser(option?.value || null)}
                        options={userData?.data?.map((user) => ({
                          value: user.id,
                          label: user.full_name
                        }))}
                      />
                    </div>
                  }
                </div>
              </>
            }

            <div className="mb-3">
              <label className="form-label">Missing Punch</label>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                {/* Hour Selector */}
                <div className='col-lg-2'>
                  <i className="fa-solid fa-angle-up mx-4" onClick={() => setHours(hours === 12 ? 0 : hours + 1)}></i>
                  <div className='col-md-10'>
                    <input
                      type="number"
                      name="hours"
                      min="0"
                      max="12"
                      className="form-control text-center time-input no-spinner"
                      value={hours}
                      onChange={handleInputChangeHours(setHours)}
                    />
                  </div>
                  <i className="fa-solid fa-angle-down mx-4" onClick={() => setHours(hours === 0 ? 12 : hours - 1)}></i>
                </div>

                <div> : </div>

                {/* Minutes Selector */}
                <div style={{ margin: '0 10px' }} className='col-lg-2'>
                  <i className="fa-solid fa-angle-up mx-4" onClick={() => setMinutes((minutes + 5) % 60)}></i>
                  <div className='col-md-10'>
                    <input
                      type="number"
                      name="minutes"
                      min="0"
                      max="59"
                      className="form-control text-center time-input no-spinner"
                      value={minutes}
                      onChange={handleInputChangeMinutes(setMinutes)}
                    />
                  </div>
                  <i className="fa-solid fa-angle-down mx-4" onClick={() => setMinutes(minutes === 0 ? 55 : minutes - 5)}></i>
                </div>

                {/* AM/PM Selector */}
                <div className='col-lg-2'>
                  <p onClick={() => setPeriod(period === 'AM' ? 'PM' : 'AM')} className="form-control text-center mt-3" style={{ cursor: 'pointer' }}>
                    {period}
                  </p>
                </div>
              </div>
            </div>
            <div className="mb-3">
              <label htmlFor="reason" className="form-label">Reason</label>
              <input
                type="text"
                className="form-control"
                id="reason"
                placeholder='Enter reason...'
                value={reason}
                onChange={handleInputChange(setReason)}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="remarks" className="form-label">Remarks</label>
              <input
                type="text"
                className="form-control"
                id="remarks"
                placeholder='Enter remarks...'
                value={remarks}
                onChange={handleInputChange(setRemarks)}
              />
            </div>
          </div>
        </form>
      </>
    ),
  };

  // Close offcanvas
  const handleCloseOffcanvas = () => {
    setShowOffcanvas(false);
  };

  const handleCloseFilterOffcanvas = () => {
    setShowFilterOffcanvas(false);
  };

  const expandedRowContent = (rowData) => {
    return (
      <>
        <div className='px-5 py-2'>
          <DataTable
            columns={expandColumns}
            data={[...rowData.expandData].reverse()}
            footer={false}
          />
        </div>
      </>
    )
  }

  return (
    <Layout>
      {permissionData?.attendance?.canAddAttendance &&
        <Punch cameraRef={cameraRef} />
      }
      <section className="section">
        <div className="row mb-3">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', alignContent: 'center' }}>
            <h3 className='mb-0'>Attendance</h3>
            <div className=''>
              <button
                type="button"
                className="btn mx-1 mt-0"
                onClick={handleFilterClick}
                style={{
                  color: '#338db5', border: '1px solid #338db5',
                  backgroundColor: bgFilter ? '#dbf4ff' : 'transparent'
                }}
              >
                <i className="fa-solid fa-bars"></i>&nbsp;Filters
              </button>
              {permissionData?.regularization?.canAddRegularization &&
                <button
                  type="button"
                  className="btn mx-1 mt-0"
                  onClick={handleEditAttendance}
                  style={{ color: '#338db5', border: '1px solid #338db5' }}
                >
                  <i className="fa-solid fa-circle-plus"></i>&nbsp;Regularization
                </button>
              }
              {permissionData?.attendance?.canAddAttendance &&
                <button
                  type="button"
                  className="btn mx-1 mt-0"
                  onClick={handleAttendanceButtonClick}
                  style={{ color: '#338db5', border: '1px solid #338db5' }}
                >
                  <i className="fa-solid fa-circle-check"></i>&nbsp;Attendance
                </button>
              }
              {permissionData?.attendance?.canExportAttendance &&
                <button
                  type="button"
                  className="btn mx-1 mt-0"
                  onClick={handleExportClick}
                  style={{ color: '#338db5', border: '1px solid #338db5' }}
                >
                  <i className="fa-solid fa-cloud-arrow-down"></i>&nbsp;Export
                </button>
              }
            </div>
          </div>
        </div>
        <div className='row'>
          <div className="col-lg-12">
            <DataTable
              columns={columns}
              data={attendance}
              expandedRowContent={(attendance) => expandedRowContent(attendance)}
              onRegularization={handleEditAttendance}
              regularizationButton={(item) => {
                if (!permissionData?.regularization?.canAddRegularization) return false;
              
                return item.date === currentDate || (item.expandData?.length ?? 0) % 2 !== 0;
              }}
              infoButton={(item) => {
                return Array.isArray(item.regularization) && item.regularization.length > 0;
              }}
              onInfo={(attendance) => handleInfoClick(attendance)}
              footer={true}
              pagination={attendanceData.pagination}
              onClickPrevious={handlePreviousClick}
              onClickNext={handleNextClick}
              onPageSizeChange={handlePageSizeChange}
            />
          </div>
        </div>

        {/* Offcanvas Component for filters or edit attendance */}
        {showOffcanvas && (
          <OffCanvas
            title={'Regularization Form'}
            content={offcanvasContent['regularization']}
            onClose={handleCloseOffcanvas}
            handleCloseOffcanvas={handleCloseOffcanvas}
            handleSaveEdit={handleSaveEditAttendance}
          />
        )}
        {showFilterOffcanvas && (
          <FilterOffCanvas
            title='Attendance'
            content={offcanvasContent['filter']}
            onClose={handleCloseFilterOffcanvas}
            handleCloseOffcanvas={handleCloseFilterOffcanvas}
            handleClearAll={handleResetFilter}
          />
        )}
      </section>

      <ModalComponent
        show={showModal}
        onHide={() => setShowModal(false)}
        title="Regularization Details"
        bodyContent={
          <>
            <div className='row'>
              <div className='col-md-6'>
                <div className='fw-bold'> User Name : </div>
                <div> {modalBody.fullName} </div>
              </div>
              <div className='col-md-6'>
                <div className='fw-bold'> Date : </div>
                <div> {modalBody.date} </div>
              </div>
            </div>
            <div className='row'>
              <div className="datatable-container px-0 mx-2 mt-4">
                <div className='datatable-wrapper '>
                  <table className="datatable">
                    <thead className='px-1'>
                      <tr style={{ backgroundColor: '#c1dde9' }}>
                        <th>Missing Punch</th>
                        <th>Reason</th>
                        <th>Remarks</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.isArray(modalBody?.regularization) && modalBody.regularization.length > 0 ? (
                        modalBody.regularization.map((reg, index) => (
                          <tr key={index}>
                            <td>{reg.punchTime}</td>
                            <td>{reg.reason}</td>
                            <td>{reg.remarks}</td>
                            <td>{reg.status}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4">No regularization records available</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        }
        size='lg'
      />
    </Layout>
  );
}

export default Attendance;