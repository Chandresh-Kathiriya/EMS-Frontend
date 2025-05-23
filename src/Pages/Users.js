// src/Pages/Users.js

// import Core module
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'react-toastify';
import { useSelector, useDispatch } from 'react-redux';
import DatePicker from "react-datepicker";

// import required components
import { apiCall } from '../Components/API'; // API call utility
import Layout from '../Components/Layout';
import DataTable from '../Components/DataTable'; // Import the DataTable component
import OffCanvas from '../Components/OffCanvas'; // For editing user in an offcanvas
import { useNavigate } from 'react-router-dom';
import FilterOffCanvas from '../Components/FilterOffCanvas';
import SelectInput from '../Components/SelectInput'

import { fetchUsersData, fetchRoles, fetchReportingManagerData, fetchWeekOffData } from '../redux/actions/usersActions';
import Swal from 'sweetalert2';

function Users() {
  const token = localStorage.getItem('token');
  // if (!token) {
  //   window.location.href = '/login'; // Redirect if no token
  // }

  const role = localStorage.getItem('role');
  const userId = localStorage.getItem('id');

  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const [showFilterOffcanvas, setShowFilterOffcanvas] = useState(false);
  const [user, setUser] = useState(null)
  const [offcanvasType, setOffcanvasType] = useState(null);
  const [per_page, setPer_page] = useState(10)
  const [page, setPage] = useState(1)
  const [total_page, setTotal_page] = useState('')
  const [offcanvasTitle, setOffcanvasTitle] = useState('')
  const [formErrors, setFormErrors] = useState({
    full_name: '',
    email: '',
    password: '',
    dob: '',
    mobileNumber: '',
    empCode: '',
    jobRole: ''
  });

  const initialFilter = () => {
    try {
      const filter = localStorage.getItem('userFilter');
      return filter ? JSON.parse(filter) : {};
    } catch (error) {
      console.error('Error parsing userFilter:', error);
      return {};
    }
  };

  const filter = initialFilter();
  const bgFilter = Object.values(filter).some(value => value != null && value !== '');

  const [filters, setFilters] = useState(() => {
    const stored = initialFilter();
    return {
      name: stored.name || '',
      empCode: stored.empCode || '',
      role: stored.role || null,
      reportingManager: stored.reportingManager || null,
    }
  })

  const dispatch = useDispatch();
  const { usersData, rolesData, reportingManager, weekOffData } = useSelector(
    (state) => state.users
  );

  const reportingManagerOptions = reportingManager?.data?.map((user) => ({
    label: user.full_name,
    value: user.id
  })) || [];

  const weekOffOption = weekOffData?.data?.map((weekOff) => ({
    label: weekOff.name,
    value: weekOff.id
  })) || [];

  const selectedManager = reportingManagerOptions.find(
    (option) => option.value === user?.reportingManager
  ) || null;

  const selectedWeekOff = weekOffOption.find(
    (option) => option.value === user?.weekOff
  ) || null;

  const roleOptions = rolesData?.roles?.map((role) => ({
    label: role.name,
    value: role.id
  })) || [];

  const selectedRole = roleOptions.find(
    (option) => option.value === user?.role
  ) || null;

  const offcanvasContent = {
    new: (
      <>
        <div className="col-lg-12">
          <form>
            <div className="row g-2">
              {role === 'Admin' &&
                <div className="col-md-4">
                  <label style={{ color: 'black' }} htmlFor="full_name" className="form-label mb-0 mt-2">Name</label>
                  <input
                    id='full_name'
                    type="text"
                    name="full_name"
                    className={`form-control ${formErrors?.full_name ? 'is-invalid' : ''}`}
                    placeholder={'Enter Name'}
                    value={user?.full_name || ''}
                    onChange={(e) => setUser({ ...user, full_name: e.target.value })}
                  />
                  {formErrors?.full_name && (
                    <div className="invalid-feedback">
                      {formErrors.full_name}
                    </div>
                  )}
                </div>
              }
              <div className="col-md-4">
                <label style={{ color: 'black' }} htmlFor="email" className="form-label mb-0 mt-2">Email</label>
                <input
                  id='email'
                  type="email"
                  name="email"
                  className={`form-control ${formErrors?.email ? 'is-invalid' : ''}`}
                  placeholder="Enter Email"
                  value={user?.email || ''}
                  onChange={(e) => setUser({ ...user, email: e.target.value })}
                />
                {formErrors?.email && (
                  <div className="invalid-feedback">
                    {formErrors.email}
                  </div>
                )}

              </div>
              <div className="col-md-4">
                <label style={{ color: 'black' }} htmlFor="password" className="form-label mb-0 mt-2">Password</label>
                <input
                  id='password'
                  type="password"
                  name="password"
                  className={`form-control ${formErrors?.password ? 'is-invalid' : ''}`}
                  placeholder={'Enter Password'}
                  onChange={(e) => setUser({ ...user, password: e.target.value })}
                />
                {formErrors?.password && (
                  <div className="invalid-feedback">
                    {formErrors.password}
                  </div>
                )}
              </div>
              <div className="col-md-4">
                <label style={{ color: 'black' }} htmlFor="dateOfBirth" className="form-label mb-0 mt-2">Date of Birth</label>
                <div
                  className={`form-control ${formErrors?.dob ? 'is-invalid' : ''}`}
                >
                  <DatePicker
                    id='dateOfBirth'
                    className='reactdatePicker'
                    placeholderText='DD/MM/YYYY'
                    selected={user?.dateOfBirth || null}
                    onSelect={(e) => {
                      setUser({ ...user, dateOfBirth: e })
                    }}
                    onChange={(e) => {
                      setUser({ ...user, dateOfBirth: e })
                    }}
                    dateFormat="dd/MM/yyyy"
                    clearButtonTitle={'Delete'}
                    isClearable={true}
                    clearButtonClassName='m-0 p-0 mx-5'
                    onChangeRaw={() => {
                      setUser({ ...user, dateOfBirth: null })
                    }}
                    maxDate={new Date()}
                  />
                </div>
                {formErrors?.dob && (
                  <div className="invalid-feedback">
                    {formErrors.dob}
                  </div>
                )}
              </div>
              <div className="col-md-4">
                <label style={{ color: 'black' }} htmlFor="mobileNumber" className="form-label mb-0 mt-2">
                  Mobile Number
                </label>
                <input
                  id='mobileNumber'
                  type="text"
                  name="mobileNumber"
                  className={`form-control ${formErrors?.mobileNumber ? 'is-invalid' : ''}`}
                  placeholder="Enter Mobile Number"
                  value={user?.mobileNumber || ''}
                  onChange={(e) => {
                    const onlyDigits = e.target.value.replace(/\D/g, ''); // allow digits only
                    if (onlyDigits.length <= 10) {
                      setUser({ ...user, mobileNumber: onlyDigits });
                    }
                  }}
                />
                {formErrors?.mobileNumber && (
                  <div className="invalid-feedback">{formErrors.mobileNumber}</div>
                )}
              </div>
              <div className="col-md-4">
                <label style={{ color: 'black' }} className="form-label mb-0 mt-2">Gender</label>
                <SelectInput
                  placeholder={'Select Gender'}
                  value={user?.gender ? { value: user.gender, label: user.gender } : null}
                  changeColor={false}
                  onChange={(selectedOption) => {
                    setUser({ ...user, gender: selectedOption.value })
                  }}
                  options={[
                    { label: 'Male', value: 'Male' },
                    { label: 'Female', value: 'Female' },
                    { label: 'Other', value: 'Other' }
                  ]}
                  isClearable={false}
                />
              </div>
              {role === 'Admin' &&
                <>
                  <div className="col-md-4">
                    <label style={{ color: 'black' }} htmlFor="empCode" className="form-label mb-0 mt-2">EMP Code</label>
                    <input
                      id='empCode'
                      type="text"
                      name="empCode"
                      className={`form-control ${formErrors?.empCode ? 'is-invalid' : ''}`}
                      placeholder={'Enter EMP Code'}
                      value={user?.empCode || ''}
                      onChange={(e) => setUser({ ...user, empCode: e.target.value })}
                      required
                    />
                    {formErrors?.empCode && (
                      <div className="invalid-feedback">
                        {formErrors.empCode}
                      </div>
                    )}
                  </div>
                  <div className="col-md-4">
                    <label style={{ color: 'black' }} className="form-label mb-0 mt-2">Job Role</label>
                    <div
                      className={`form-control p-0 ${formErrors?.dob ? 'is-invalid p-0' : ''}`}
                    >
                      <SelectInput
                        placeholder={'Select Job Role'}
                        value={selectedRole}
                        changeColor={false}
                        onChange={(selectedOption) => {
                          setUser({ ...user, role: selectedOption.value })
                        }}
                        options={roleOptions}
                        isClearable={false}
                      />
                    </div>
                    {formErrors?.jobRole && (
                      <div className="invalid-feedback">
                        {formErrors.jobRole}
                      </div>
                    )}
                  </div>
                  <div className="col-md-4">
                    <label style={{ color: 'black' }} className="form-label mb-0 mt-2">Reporting Manager</label>
                    <SelectInput
                      placeholder={'Select Reporting Manager'}
                      value={selectedManager}
                      changeColor={false}
                      onChange={(selectedOption) => {
                        setUser({ ...user, reportingManager: selectedOption.value })
                      }}
                      options={reportingManagerOptions}
                      isClearable={false}
                    />
                  </div>
                  <div className="col-md-4">
                    <label style={{ color: 'black' }} htmlFor="dateOfJoining" className="form-label mb-0 mt-2">Date of Joining</label>
                    <div className='form-control'>
                      <DatePicker
                        id='dateOfJoining'
                        className='reactdatePicker'
                        placeholderText='DD/MM/YYYY'
                        selected={user?.dateOfJoining || null}
                        onSelect={(e) => {
                          setUser({ ...user, dateOfJoining: e })
                        }}
                        onChange={(e) => {
                          setUser({ ...user, dateOfJoining: e })
                        }}
                        dateFormat="dd/MM/yyyy"
                        clearButtonTitle={'Delete'}
                        isClearable={true}
                        clearButtonClassName='m-0 p-0 mx-5'
                        onChangeRaw={() => {
                          setUser({ ...user, dateOfJoining: null })
                        }}
                      />
                    </div>
                  </div>
                  <div className="col-md-4">
                    <label style={{ color: 'black' }} className="form-label mb-0 mt-2">Designation</label>
                    <SelectInput
                      placeholder={'Select Designation'}
                      value={user?.designation ? { value: user.designation, label: user.designation } : null}
                      changeColor={false}
                      onChange={(selectedOption) => {
                        setUser({ ...user, designation: selectedOption.value })
                      }}
                      options={[
                        { label: 'Senior Developer', value: 'Senior Developer' },
                        { label: 'Junior Developer', value: 'Junior Developer' },
                        { label: 'Team Lead', value: 'Team Lead' }
                      ]}
                      isClearable={false}
                    />
                  </div>
                  <div className="col-md-4">
                    <label style={{ color: 'black' }} className="form-label mb-0 mt-2">Week Off</label>
                    <SelectInput
                      placeholder={'Select Week Off'}
                      value={selectedWeekOff}
                      changeColor={false}
                      onChange={(selectedOption) => {
                        setUser({ ...user, weekOff: selectedOption.value })
                      }}
                      options={weekOffOption}
                      isClearable={false}
                    />
                  </div>
                </>
              }
            </div>
          </form>
        </div>
      </>
    )
  };

  // Handle save after edit
  const handleEditSave = async () => {

    const errors = {};

    if (!user.email?.trim()) {
      errors.email = 'Email Required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)) {
      errors.email = 'Invalid Email Format';
    }

    if (!user.mobileNumber?.trim()) {
      errors.mobileNumber = 'Mobile Number Required';
    } else if (!/^\d{10}$/.test(user.mobileNumber)) {
      errors.mobileNumber = 'Mobile Number must be 10 digits';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors); // No need to spread prev
      return;
    } else {

      try {
        const response = await apiCall(`users/editUserById`, token, 'POST', user)
        if (response.message) {
          toast.success('User updated successfully');
          setShowOffcanvas(false); // Close offcanvas
          let userToId = null;
          if (role !== 'Admin') {
            userToId = user.id
          }
          dispatch(fetchUsersData(token, per_page, page, userToId));
        } else {
          toast.error('something error')
        }
      } catch (error) {
        toast.error('Failed to update user.');
        console.error('Error saving user data:', error);
      }
    }
  };

  // Handle save after creating new user
  const handleNewSave = async () => {
    const errors = {};

    if (!user.full_name?.trim()) {
      errors.full_name = 'Name Required';
    }
    if (!user.email?.trim()) {
      errors.email = 'Email Required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)) {
      errors.email = 'Invalid Email Format';
    }
    if (!user.password) {
      errors.password = 'Password Required';
    }
    if (!user.dateOfBirth) {
      errors.dob = 'Date of Birth Required';
    }
    if (!user.mobileNumber?.trim()) {
      errors.mobileNumber = 'Mobile Number Required';
    } else if (!/^\d{10}$/.test(user.mobileNumber)) {
      errors.mobileNumber = 'Mobile Number must be 10 digits';
    }
    if (!user.empCode) {
      errors.empCode = 'EMP CODE Required';
    }
    if (!user.role) {
      errors.jobRole = 'Job Role Required';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors); // No need to spread prev
      return;
    }

    try {
      const response = await apiCall(`users/createUser`, token, 'POST', user);

      if (response.message === 'User alredy exist.') {
        toast.error(response.message);
      } else if (response.message === 'User created successfully.') {
        toast.success(response.message);
        setShowOffcanvas(false);
        dispatch(fetchUsersData(token, per_page, page));
      }
    } catch (error) {
      toast.error('Failed to create user.');
      console.error('Error saving user data:', error);
    }
  };

  // Handle new user
  const handleNewUser = () => {
    setUser({
      full_name: '',
      email: '',
      password: '',
      dateOfBirth: '',
      mobileNumber: '',
      gender: '',
      empCode: '',
      role: '',
      reportingManager: '',
      dateOfJoining: new Date(),
      designation: '',
      weekOff: ''
    });
    setOffcanvasType('new');
    setOffcanvasTitle('Create New User')
    setShowOffcanvas(true);
  };

  const navigate = useNavigate();
  const handleRoles = () => {
    navigate('./manageroles');
  }

  // Update User Handler
  const handleEditUser = (user) => {
    setUser({
      id: user.id,
      full_name: user.full_name || '',
      email: user.email || '',
      password: user.password || '',
      dateOfBirth: user.dateOfBirth || '',
      mobileNumber: user.mobileNumber || '',
      gender: user.gender || '',
      role: user.role_id || '',
      reportingManager: user.parent_id || '',
      empCode: user.empCode || '',
      dateOfJoining: user.dateOfJoining || '',
      designation: user.designation || '',
      weekOff: user.weekOff || ''
    });

    setOffcanvasType('new');
    setOffcanvasTitle('Update User')
    setShowOffcanvas(true);
  };

  const handleDeleteUser = (user) => {
    Swal.fire({
      title: "Are you sure?",
      text: `You want to delete this User?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!"
    }).then(async (result) => {
      if (result.isConfirmed) {
        const data = { user: user.id }
        const response = await apiCall('users/deleteUser', null, 'POST', data)
        if (response) {
          toast.success(response.message || 'User Deleted!')
          dispatch(fetchUsersData(token, per_page, page));
        }
      }
    })
  }

  // Close offcanvas
  const handleCloseOffcanvas = () => {
    setFormErrors({
      full_name: '',
      email: '',
      password: '',
      dob: '',
      mobileNumber: '',
      empCode: '',
      jobRole: ''
    })
    setShowOffcanvas(false);
  };

  const handleCloseFilterOffcanvas = () => {
    setShowFilterOffcanvas(false);
  };

  // Define table columns
  const columns = [
    { Header: 'Name', accessor: 'full_name', sortable: true },
    { Header: 'EMP Code', accessor: 'empCode', sortable: true },
    { Header: 'Role', accessor: 'role', sortable: true },
    { Header: 'Email', accessor: 'email', sortable: true },
    { Header: 'Mobile Number', accessor: 'mobileNumber', sortable: true },
    { Header: 'Reporting Manager', accessor: 'reportingManager', sortable: true },
  ];

  const expandedRowContent = (user) => (
    <>
      <div className="datatable-container" style={{ margin: '20px' }}>
        <div className='datatable-wrapper'>
          <table className="datatable" >
            <thead>
              <tr style={{ backgroundColor: '#c1dde9', height: '40px' }}>
                <th style={{ paddingLeft: '10px' }}>Date Of Joining</th>
                <th>Mobile Number</th>
                <th>Email</th>
                <th>Date Of Birth</th>
                <th>Week Off</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ paddingLeft: '10px' }}>{user.dateOfJoining}</td>
                <td>{user.mobileNumber}</td>
                <td>{user.email}</td>
                <td>{user.dateOfBirth}</td>
                <td>{user.weekOff}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );

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

  const handleClearAll = () => {
    // Check if filters have values before clearing them
    if (
      filters.name ||
      filters.empCode ||
      filters.role ||
      filters.reportingManager
    ) {
      setFilters({
        name: '',
        empCode: '',
        role: null,
        reportingManager: null
      });
    } else {
      return;
    }
  };

  // Generic debounce handler for all filter changes
  const handleFilterChange = useCallback((e, filterName) => {
    const value = e?.value || e?.target?.value;

    setFilters((prevFilters) => {
      const updatedFilters = { ...prevFilters, [filterName]: value };
      return updatedFilters;
    });
  }, []);

  const debounceTimeout = useRef(null);

  useEffect(() => {
    if (token) {
      if (role === 'Admin') {
        dispatch(fetchRoles(token));
        dispatch(fetchReportingManagerData(token));
        dispatch(fetchWeekOffData(token));
      }
      let user;
      if (role !== 'Admin') {
        user = userId;
      }

      const filterParams = {
        name: filters.name,
        empCode: filters.empCode,
        role: filters.role,
        reportingManager: filters.reportingManager
      };

      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }

      debounceTimeout.current = setTimeout(() => {
        dispatch(fetchUsersData(token, per_page, page, user, filterParams));
      }, 500);
    }
  }, [token, per_page, page, userId, role, filters, dispatch]);

  useEffect(() => {
    if (usersData.pagination) {
      setPage(usersData.pagination.page);
      setPer_page(usersData.pagination.per_page);
      setTotal_page(usersData.pagination.total_pages);
    }
  }, [usersData.pagination]);

  useEffect(() => {
    localStorage.setItem('userFilter', JSON.stringify(filters));
  }, [filters]);

  return (
    <Layout>
      <section className="section">

        <div className="row mb-3">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', alignContent: 'center' }}>
            <h3>Users</h3>
            {role === 'Admin' &&
              <div>
                <button
                  type="button"
                  className="btn mx-1 mt-0"
                  onClick={() => { setShowFilterOffcanvas(true) }} // Pass userToEdit as the parameter
                  style={{
                    color: '#338db5',
                    border: '1px solid #338db5',
                    backgroundColor: bgFilter ? '#dbf4ff' : 'transparent'
                  }}
                >
                  <i className="fa-solid fa-bars"></i>&nbsp;
                  Filters
                </button>
                <button
                  type="button"
                  className="btn mx-1 mt-0"
                  onClick={handleNewUser}
                  style={{ color: '#338db5', border: '1px solid #338db5' }}
                >
                  <i className="fa-solid fa-circle-plus"></i>&nbsp;User
                </button>
                <button
                  type="button"
                  className="btn mx-1 mt-0"
                  onClick={handleRoles}
                  style={{ color: '#338db5', border: '1px solid #338db5' }}
                >
                  <i className="fa-solid fa-circle-plus"></i>&nbsp;Roles
                </button>
              </div>
            }
          </div>
        </div>

        <div className='row'>
          <div className="col-lg-12">
            <DataTable
              columns={columns}
              data={usersData.data}
              pagination={usersData.pagination}
              onClickPrevious={handlePreviousClick}
              onClickNext={handleNextClick}
              onPageSizeChange={handlePageSizeChange}
              expandedRowContent={expandedRowContent}
              editButton={(row) => row.role !== 'Admin'}
              onEdit={handleEditUser}
              deleteButton={(row) => row.role !== 'Admin' && role === 'Admin'}
              onDelete={handleDeleteUser}
              footer={true}
            />
          </div>
        </div>

      </section>

      {showOffcanvas && (
        <OffCanvas
          title={offcanvasTitle}
          content={offcanvasContent[offcanvasType]}
          onClose={handleCloseOffcanvas}
          handleCloseOffcanvas={handleCloseOffcanvas}
          handleSaveEdit={offcanvasTitle === 'Update User' ? handleEditSave
            : offcanvasTitle === 'Create New User' ? handleNewSave
            
              : ''}
        />
      )}

      {showFilterOffcanvas && (
        <FilterOffCanvas
          title='User'
          content={
            <>
              <div className="form-group pb-2">
                <label htmlFor='name'>Name</label>
                <input
                  id='name'
                  type='text'
                  name='name'
                  className='form-control'
                  placeholder='Enter Name'
                  value={filters.name || ''}
                  onChange={(e) => handleFilterChange(e, 'name')}
                />
              </div>

              <div className="form-group py-2">
                <label htmlFor='empCode'>Emp Code</label>
                <input
                  id='empCode'
                  type='text'
                  name='empCode'
                  className='form-control'
                  placeholder='Enter EMP Code'
                  value={filters.empCode || ''}
                  onChange={(e) => handleFilterChange(e, 'empCode')}
                />
              </div>
              <div className="form-group py-2">
                <label>Role</label>
                <SelectInput
                  placeholder="Select Role"
                  value={
                    filters.role
                      ? {
                        value: filters.role,
                        label: rolesData?.roles?.find((role) => role.id === filters.role)?.name,
                      }
                      : null
                  }
                  onChange={(e) => handleFilterChange(e, 'role')}
                  options={rolesData?.roles?.map((role) => ({
                    value: role.id,
                    label: role.name,
                  }))}
                />
              </div>

              <div className="form-group py-2">
                <label>Reporting Manager</label>
                <SelectInput
                  placeholder="Select Reporting Manager"
                  value={
                    filters.reportingManager
                      ? {
                        value: filters.reportingManager,
                        label: reportingManager?.data?.find((user) => user.id === filters.reportingManager)?.full_name,
                      }
                      : null
                  }
                  onChange={(e) => handleFilterChange(e, 'reportingManager')}
                  options={reportingManager?.data?.map((user) => ({
                    value: user.id,
                    label: user.full_name,
                  }))}
                />
              </div>
            </>
          }
          onClose={handleCloseFilterOffcanvas}
          handleCloseOffcanvas={handleCloseFilterOffcanvas}
          handleClearAll={handleClearAll}
        />
      )}

    </Layout>
  );
}

export default Users;