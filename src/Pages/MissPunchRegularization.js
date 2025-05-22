// src/Pages/MissPunchRegularization.js

// import core module
import React, { useState, useEffect } from 'react';
import DatePicker from "react-datepicker";
import { toast } from 'react-toastify';
import { useSelector, useDispatch } from 'react-redux';

// import require component
import Layout from '../Components/Layout';
import DataTable from '../Components/DataTable';
import OffCanvas from '../Components/OffCanvas';
import FilterOffCanvas from '../Components/FilterOffCanvas';
import SelectInput from '../Components/SelectInput';

import { ModalComponent } from '../Components/Model';

import { fetchAttendanceData, fetchUserData } from '../redux/actions/missPunchActions';
import { apiCall } from '../Components/API';

const MissPunchRegularization = () => {
  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const [showFilterOffcanvas, setShowFilterOffcanvas] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalBody, setModalBody] = useState([]);
  const [regularizationForm, setRegularizationForm] = useState({
    date: new Date(),
    timeIn: '',
    timeOut: '',
    user: null,
    hours: '0',
    minutes: '0',
    period: 'AM',
    reason: '',
    remarks: ''
  })
  const [filters, setFilters] = useState({
    user: null,
    fromDate: '',
    toDate: '',
  })
  const [formErrors, setFormErrors] = useState({
    date: '',
    user: '',
    timeIn: '',
    reason: '',
    remarks: ''
  });
  const [per_page, setPer_page] = useState(10)
  const [page, setPage] = useState(1)
  const [total_page, setTotal_page] = useState('')
  const [attendance, setAttendance] = useState([]);

  const token = localStorage.getItem('token')
  const user = localStorage.getItem('id')
  const role = localStorage.getItem('role')

  const dispatch = useDispatch();
  const { attendanceData, userData } = useSelector(
    (state) => state.missPunch
  );

  const sortAttendanceData = () => {
    try {
      const data = attendanceData.data;

      const preparedData = [];
      const dataForUser = [];

      const seenKeys = new Set();

      data.forEach(entry => {
        const { userId, date, records = [], regularization = [] } = entry;

        if (!Array.isArray(records) || records.length === 0) return;

        const sortedLogs = records.sort((a, b) => new Date(a.time) - new Date(b.time));
        const lastLog = sortedLogs[0];
        const firstLog = sortedLogs[sortedLogs.length - 1];

        let rawTimeIn = lastLog.time;
        let rawTimeOut = firstLog.time;

        const timeIn = formatTime(rawTimeIn);
        const timeOut = formatTime(rawTimeOut);
        const fullName = firstLog?.User?.full_name || '';
        const latitude = lastLog?.latitude || '';
        const longitude = lastLog?.longitude || '';
        const imageURL = lastLog?.imageURL || '';
        const count = records.length;

        const expandData = sortedLogs.map(log => ({
          imageURL: log.imageURL,
          time: formatTime(log.time),
          latitude: log.latitude,
          longitude: log.longitude,
        }));

        const filteredRegularization = regularization.filter(item => item.userId === userId && item.date === date);

        const userLog = {
          userIdForAttendance: userId,
          fullName,
          date,
          timeIn,
          timeOut,
          latitude,
          longitude,
          imageURL,
          expandData,
          regularization: filteredRegularization,
          count
        };

        const key = `${userId}_${date}`;

        // Admin or all-user case
        if (!seenKeys.has(key)) {
          preparedData.push(userLog);
          seenKeys.add(key);
        }

        // Specific user case
        if (userId == user) {
          if (!dataForUser.find(log => log.userIdForAttendance === userId && log.date === date)) {
            dataForUser.push(userLog);
          }
        }
      });

      // Set state based on role
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

  const formatTime = (isoString) => {
    if (!isoString) return '';
    return new Date(isoString).toLocaleTimeString('en-GB', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

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

  useEffect(() => {
    let dataUser = null;
    if (role !== 'Admin') {
      dataUser = user
    }

    const params = {
      dataUser,
      page,
      per_page,
      filterUser : filters.user,
      fromDate : filters.fromDate,
      toDate : filters.toDate,
    }
    dispatch(fetchAttendanceData(token, params));
    dispatch(fetchUserData(token));
  }, [dispatch, token, per_page, page, filters]);

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
  }, [attendanceData.data, attendanceData.pagination]);

  const columns = [
    { Header: 'Image', accessor: 'imageURL' },
    { Header: 'User', accessor: 'fullName' },
    { Header: 'Date', accessor: 'date' },
    { Header: 'Time In', accessor: 'timeIn' },
    { Header: 'Time Out', accessor: 'timeOut' },
    { Header: 'Count', accessor: 'count' },
  ]

  const expandColumns = [
    { Header: 'Image', accessor: 'imageURL' },
    { Header: 'Time', accessor: 'time' },
    { Header: 'Location', accessor: 'location' },
  ];

  const expandedRowContent = (rawData) => {
    return (
      <>
        <div className='px-5 py-2'>
          <DataTable
            columns={expandColumns}
            data={[...rawData.expandData].reverse()}
            footer={false}
          />
        </div>
      </>
    )
  }

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
      processedValue = value ? value : null;
    }

    setFilters(prev => ({
      ...prev,
      [filterName]: processedValue
    }));
  };

  const regularizationDateUpdate = (value, filterName) => {
    let processedValue;

    if (value) {
      const year = value.getFullYear();
      const month = String(value.getMonth() + 1).padStart(2, '0');
      const day = String(value.getDate()).padStart(2, '0');
      processedValue = `${year}-${month}-${day}`;
    } else {
      processedValue = '';
    }

    setRegularizationForm(prev => ({
      ...prev,
      [filterName]: processedValue
    }));
  };

  const userOption = userData?.data?.map((user) => ({
    value: user.id,
    label: user.full_name

  }))

  const offcanvasContent = {
    filter: (
      <>
        <div className='col-lg-12'>
          {role === 'Admin' &&
            <div className="form-group">
              <label>User</label>
              <SelectInput
                placeholder="Select User"
                value={userOption?.find(option => option.value === filters.user) || null}
                onChange={(option) =>
                  handleFilterUpdate(option?.value ?? null, 'user')
                }
                options={userOption}
                isClearable
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
            {regularizationForm.date && regularizationForm.timeIn &&
              <>
                <div className="d-flex col-lg-12">
                  <h6 className="mx-1 col-md-4" style={{ color: 'black' }}>Date</h6>
                  <h6 className="mx-1 col-md-4" style={{ color: 'black' }}>Log In</h6>
                  <h6 className="mx-1 col-md-4" style={{ color: 'black' }}>Last Login</h6>
                </div>
                <div className="d-flex mb-3 col-lg-12">
                  <h6 className="mx-1 col-md-4" style={{ color: 'black' }}>{regularizationForm?.date}</h6>
                  <h6 className="mx-1 col-md-4" style={{ color: 'black' }}>{regularizationForm?.timeIn}</h6>
                  <h6 className="mx-1 col-md-4" style={{ color: 'black' }}>{regularizationForm?.timeOut}</h6>
                </div>
              </>
            }
            {!(regularizationForm.timeIn) && !(regularizationForm.timeOut) &&
              <>
                <div className='col-lg-12 d-flex'>
                  <div className='col-md-6 mb-3 px-1'>
                    <label>Date</label>
                    <div className={`form-control ${formErrors?.date ? 'is-invalid' : ''}`}>
                      <DatePicker
                        className='reactdatePicker'
                        selected={regularizationForm.date}
                        onChange={(date) => regularizationDateUpdate(date, 'date')}
                        dateFormat="dd/MM/yyyy"
                        placeholderText="DD/MM/YYYY"
                        isClearable
                        clearButtonClassName='m-0 p-0 mx-5'
                      />
                    </div>
                    {formErrors?.date && (
                      <div className="invalid-feedback">
                        {formErrors.date || 123}
                      </div>
                    )}
                  </div>
                  {role === 'Admin' &&
                    <div className="form-group col-md-6 px-1">
                      <label>User</label>
                      <div className={`form-control p-0 m-0 ${formErrors?.user ? 'is-invalid' : ''}`}>
                        <SelectInput
                          placeholder={'Select User'}
                          value={userOption?.find(option => option.value === regularizationForm.user) || null}
                          onChange={(option) =>
                            setRegularizationForm(prev => ({
                              ...prev,
                              user: option?.value || null
                            }))
                          }
                          options={userOption}
                        />
                      </div>
                      {formErrors?.user && (
                        <div className="invalid-feedback">
                          {formErrors.user}
                        </div>
                      )}
                    </div>
                  }
                </div>
              </>
            }

            <div className="mb-3">
              <div className="form-group">
                <label className="form-label">Missing Punch</label>

                {/* Custom time input group */}
                <div className={`d-flex align-items-center flex-wrap ${formErrors?.time ? 'is-invalid' : ''}`}>

                  {/* Hour Selector */}
                  <div className="col-lg-2">
                    <i className="fa-solid fa-angle-up mx-4"
                      onClick={() =>
                        setRegularizationForm(prev => {
                          const currentHours = parseInt(prev.hours, 10) || 0;
                          return {
                            ...prev,
                            hours:
                              currentHours === 12 ? 0 :
                                currentHours === 0 ? 1 :
                                  currentHours + 1
                          };
                        })
                      }
                    ></i>

                    <div className="col-md-10">
                      <input
                        type="number"
                        name="hours"
                        min="0"
                        max="12"
                        className={`form-control text-center time-input no-spinner ${formErrors?.time ? 'is-invalid' : ''}`}
                        value={regularizationForm.hours}
                        onChange={(e) =>
                          setRegularizationForm(prev => ({
                            ...prev,
                            hours: parseInt(e.target.value, 10) || 0
                          }))
                        }
                      />
                    </div>

                    <i className="fa-solid fa-angle-down mx-4"
                      onClick={() =>
                        setRegularizationForm(prev => ({
                          ...prev,
                          hours: prev.hours === 0 ? 12 : prev.hours - 1
                        }))
                      }
                    ></i>
                  </div>

                  <div> : </div>

                  {/* Minutes Selector */}
                  <div className="col-lg-2" style={{ margin: '0 10px' }}>
                    <i className="fa-solid fa-angle-up mx-4"
                      onClick={() =>
                        setRegularizationForm(prev => ({
                          ...prev,
                          minutes: (prev.minutes + 5) % 60
                        }))
                      }
                    ></i>

                    <div className="col-md-10">
                      <input
                        type="number"
                        name="minutes"
                        min="0"
                        max="59"
                        className={`form-control text-center time-input no-spinner ${formErrors?.time ? 'is-invalid' : ''}`}
                        value={regularizationForm.minutes}
                        onChange={(e) =>
                          setRegularizationForm(prev => ({
                            ...prev,
                            minutes: parseInt(e.target.value, 10) || 0
                          }))
                        }
                      />
                    </div>

                    <i className="fa-solid fa-angle-down mx-4"
                      onClick={() =>
                        setRegularizationForm(prev => ({
                          ...prev,
                          minutes: prev.minutes === 0 ? 55 : prev.minutes - 5
                        }))
                      }
                    ></i>
                  </div>

                  {/* AM/PM Selector */}
                  <div className="col-lg-2">
                    <p
                      onClick={() =>
                        setRegularizationForm(prev => ({
                          ...prev,
                          period: prev.period === 'AM' ? 'PM' : 'AM'
                        }))
                      }
                      className='form-control text-center mt-3'
                      style={{ cursor: 'pointer' }}
                    >
                      {regularizationForm.period}
                    </p>
                  </div>
                </div>

                {/* Error message */}
                {formErrors?.time && (
                  <div className="invalid-feedback d-block mt-1">
                    {formErrors.time}
                  </div>
                )}
              </div>
            </div>


            <div className="mb-3">
              <label htmlFor="reason" className="form-label">Reason</label>
              <input
                type="text"
                className={`form-control ${formErrors?.reason ? 'is-invalid' : ''}`}
                id="reason"
                placeholder='Enter reason...'
                value={regularizationForm.reason}
                onChange={(e) =>
                  setRegularizationForm(prev => ({
                    ...prev,
                    reason: e.target.value
                  }))
                }
              />
              {formErrors?.reason && (
                <div className="invalid-feedback">
                  {formErrors.reason}
                </div>
              )}
            </div>
            <div className="mb-3">
              <label htmlFor="remarks" className="form-label">Remarks</label>
              <input
                type="text"
                className={`form-control ${formErrors?.remarks ? 'is-invalid' : ''}`}
                id="remarks"
                placeholder='Enter remarks...'
                value={regularizationForm.remarks}
                onChange={(e) =>
                  setRegularizationForm(prev => ({
                    ...prev,
                    remarks: e.target.value
                  }))
                }
              />
              {formErrors?.remarks && (
                <div className="invalid-feedback">
                  {formErrors.remarks}
                </div>
              )}
            </div>
          </div>
        </form>
      </>
    ),
  };

  const handleEditAttendance = (attendance) => {
    setRegularizationForm({
      user: attendance.userIdForAttendance !== undefined ? attendance.userIdForAttendance : (role === 'Admin' ? '' : user),
      date: attendance.date,
      timeIn: attendance.timeIn,
      timeOut: attendance.timeOut,
      hours: attendance.hours || '0',
      minutes: attendance.minutes || '0',
      period: attendance.period || 'AM',
      reason: attendance.reason || '',
      remarks: attendance.remarks || ''
    });
    setShowOffcanvas(true);
  };

  const handleSaveEditAttendance = async () => {
    const errors = {};
    const hours = parseInt(regularizationForm.hours, 10) || 0;
    const minutes = parseInt(regularizationForm.minutes, 10) || 0;
    if (!regularizationForm.date) {
      errors.date = 'Date is required';
    }

    if (!regularizationForm.user) {
      errors.user = 'User is required';
    }

    if (hours === 0 && minutes === 0) {
      errors.time = 'Time is required';
    }

    if (!regularizationForm.reason) {
      errors.reason = 'Reason is required';
    }

    if (!regularizationForm.remarks) {
      errors.remarks = 'Remarks is required';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors); // No need to spread prev
      return;
    } else {

      let hourForRegularization = regularizationForm.hours;
      if (regularizationForm.period === 'PM' && hourForRegularization < 12) {
        hourForRegularization += 12;
      }
      if (regularizationForm.period === 'AM' && hourForRegularization === 12) {
        hourForRegularization = 0; // 12 AM should be 0 in 24-hour format
      }

      const formattedTime = `${hourForRegularization.toString().padStart(2, '0')}:${regularizationForm.minutes.toString().padStart(2, '0')}`;

      const formData = {
        attendanceDate: regularizationForm.date,
        attendanceUser: regularizationForm.user,
        time: formattedTime,
        reason: regularizationForm.reason,
        remarks: regularizationForm.remarks,
      };

      const response = await apiCall('attendance/createRegularization', token, 'POST', formData);
      if (response) {
        toast.success('Regularization created Successfully');
        setShowOffcanvas(false); // Close offcanvas
      }
    }
  };

  const handleCloseOffcanvas = () => {
    setFormErrors({
      date: '',
      user: '',
      time: '',
      reason: '',
      remarks: ''
    })
    setShowOffcanvas(false)
  }

  const handleResetFilter = () => {
    setFilters({
      user: null,
      fromDate: '',
      toDate: '',
    })
  };

  return (
    <Layout>
      <section className="section">
        <div className="row mb-3">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', alignContent: 'center' }}>
            <h3 className='mb-0'>Missing Punch Regularization</h3>
            <div className=''>
              <button
                type="button"
                className="btn mx-1 mt-0"
                onClick={() => setShowFilterOffcanvas(true)}
                style={{
                  color: '#338db5', border: '1px solid #338db5',
                  backgroundColor: 'transparent'
                }}
              >
                <i className="fa-solid fa-bars"></i>&nbsp;Filters
              </button>
              <button
                type="button"
                className="btn mx-1 mt-0"
                onClick={handleEditAttendance}
                style={{ color: '#338db5', border: '1px solid #338db5' }}
              >
                <i className="fa-solid fa-circle-plus"></i>&nbsp;Regularization
              </button>
            </div>
          </div>
        </div>
        <div className='row'>
          <div className="col-lg-12">
            <DataTable
              columns={columns}
              data={attendance}
              expandedRowContent={(attendance) => expandedRowContent(attendance)}
              onRegularization={(attendance) => handleEditAttendance(attendance)}
              regularizationButton={(attendance) => attendance.userIdForAttendance == user}
              infoButton={(attendance) => attendance.regularization?.length > 0}
              onInfo={(attendance) => {
                setModalBody(attendance)
                setShowModal(true)
              }}
              footer={true}
              pagination={attendanceData.pagination}
              onClickPrevious={handlePreviousClick}
              onClickNext={handleNextClick}
              onPageSizeChange={handlePageSizeChange}
            />
          </div>
        </div>
      </section>

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
          onClose={() => setShowFilterOffcanvas(false)}
          handleCloseOffcanvas={() => setShowFilterOffcanvas(false)}
          handleClearAll={handleResetFilter}
        />
      )}

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
};

export default MissPunchRegularization;