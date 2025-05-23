// src/Pages/Leave

// import core module
import React, { useContext, useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import DatePicker from "react-datepicker";
import { PermissionContext } from '../Context/PermissionContext';

// import required components
import DataTable from '../Components/DataTable';
import { apiCall } from '../Components/API'; // API call utility
import Layout from '../Components/Layout';
import OffCanvas from '../Components/OffCanvas';
import FilterOffCanvas from '../Components/FilterOffCanvas';
import SelectInput from '../Components/SelectInput';

import { fetchLeaveData, fetchLeaveTypeData } from '../redux/actions/leaveActions';

function Leave() {
  const { permissionData } = useContext(PermissionContext);
  const token = localStorage.getItem('token');  // Get token from local storage
  // if (!token) {
  //   window.location.href = '/login'; // Redirect if no token
  // }
  const role = localStorage.getItem('role');

  const empCode = localStorage.getItem('empCode')
  const userId = localStorage.getItem('id')

  const initialFilter = () => {
    try {
      const filter = localStorage.getItem('leaveFilter');
      return filter ? JSON.parse(filter) : {};
    } catch (error) {
      console.error('Error parsing leaveFilter:', error);
      return {};
    }
  };

  const filter = initialFilter();
  const bgFilter = Object.values(filter).some(value => value != null && value !== '');

  const [selectedUser, setSelectedUser] = useState(null); // User selected for editing
  const [showOffcanvas, setShowOffcanvas] = useState(false); // To show/hide offcanvas
  const [showFilterOffcanvas, setShowFilterOffcanvas] = useState(false); // To show/hide offcanvas
  const [loading, setLoading] = useState(false); // For loading state
  const [offcanvasType, setOffcanvasType] = useState(null); // For determining offcanvas content type
  const [per_page, setPer_page] = useState(10)
  const [page, setPage] = useState(1)
  const [total_page, setTotal_page] = useState('')

  const [filters, setFilters] = useState(() => {
    const init = initialFilter();
    return {
      status: init.status || null,
      fromDate: init.fromDate || '',
      toDate: init.toDate || ''
    };
  });

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value // This will be null when cleared
    }));
  };

  const handleDateChange = (date, field) => {
    if (field === 'fromDate') {
      const updatedFilters = {
        ...filters,
        fromDate: date,
      };
  
      // Only clear To date if it exists and is before the new From date
      if (filters.toDate && date && new Date(date) > new Date(filters.toDate)) {
        updatedFilters.toDate = null;
      }
  
      setFilters(updatedFilters);
    } else if (field === 'toDate') {
      setFilters({
        ...filters,
        toDate: date,
      });
    }
  };

  const [formData, setFormData] = useState({
    userId: userId,
    empCode: empCode,
    leaveReason: '',
    leaveType: '',
    startDate: null,
    endDate: null,
    leaveStartDay: 'Full Day',
    leaveEndDay: 'Full Day',
  });

  // Handle form field change
  const handleInputChange = (e, customField = null) => {
    if (customField) {
      // For custom components like SelectInput
      setFormData(prevState => ({
        ...prevState,
        [customField]: e // Here e is the selected value from the custom component
      }));
    } else {
      // For native form inputs (input, textarea, etc.)
      const { id, value } = e.target;
      setFormData(prevState => ({
        ...prevState,
        [id]: value
      }));
    }
  };

  const handleNewLeave = () => {
    setFormData({
      userId: userId,
      empCode: empCode,
      leaveReason: '',
      leaveType: null,
      startDate: null,
      leaveStartDay: null,
      endDate: null,
      leaveEndDay: null,
    });
    setOffcanvasType('newLeave');
    setShowOffcanvas(true);
  };

  const handleEdit = (leave) => {
    setSelectedUser(leave);
    setFormData({
      userId: userId,
      empCode: empCode,
      leaveReason: leave.leaveReason,
      leaveType: leave.leaveType,
      startDate: leave.startDate,
      leaveStartDay: leave.StartDay,
      endDate: leave.endDate,
      leaveEndDay: leave?.endDay,
      leaveStartDay: leave.startDay,
    });
    setOffcanvasType('edit');
    setShowOffcanvas(true);
  };

  const handleDelete = (leave) => {
    Swal.fire({
      title: "Are you sure?",
      text: `You want to delete this Leave?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!"
    }).then(async (result) => {
      if (result.isConfirmed) {
        const data = {
          leaveId: leave.id
        }
        const deleteLeave = await apiCall('leave/deleteLeave', null, 'POST', data)
        if (deleteLeave?.success === true) {
          toast.success(deleteLeave?.message)
        }
        dispatch(fetchLeaveData(token, per_page, page));
      }
    });
  }

  const handleSaveNewLeave = async (e) => {
    e.preventDefault();
    try {
      if (!(formData.leaveReason) || !(formData.leaveType) || !(formData.startDate) || !(formData.leaveStartDay)) {
        toast.error('Please Fill All Required Feilds First')
      } else {
        const response = await apiCall('leave/newLeave', token, 'POST', formData);
        if (response) {
          toast.success(response?.message || 'Leave created successfully!')
          setShowOffcanvas(false);
          dispatch(fetchLeaveData(token, per_page, page));
        }
      }
    } catch (error) {
      console.error('Error applying leave:', error);
    }
  };

  const handleSaveEdit = async () => {
    try {
      if (!(formData.leaveReason) || !(formData.leaveStartDay) || !(formData.leaveType) || !(formData.startDate)) {
        toast.error('Please add required feilds.')
        return
      }
      const response = await apiCall(`leave/updateLeaveBy?id=${selectedUser.id}`, token, 'POST', formData);
      if (response) {
        toast.success('Leave updated successfully!');
        setShowOffcanvas(false);
        dispatch(fetchLeaveData(token, per_page, page));
      }
    } catch (error) {
      console.error('Error updating leave:', error);
    }
  };

  const handleFilterClick = () => {
    setShowFilterOffcanvas(true);
  };

  const handleCloseOffcanvas = () => {
    setShowOffcanvas(false);
  };

  const handleCloseFilterOffcanvas = () => {
    setShowFilterOffcanvas(false);
  };

  const handleClearAll = () => {
    setFilters({
      status: null,
      fromDate: '',
      toDate: '',
    })
  }

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
  const { leaveData, leaveTypeData } = useSelector(
    (state) => state.leave
  );

  useEffect(() => {
    if (token && !loading) {  // Only fetch if we have a token and not already loading
      const params = {
        per_page,
        page,
        status: filters.status,
        fromDate: filters.fromDate,
        toDate: filters.toDate,
      };
      dispatch(fetchLeaveData(token, params));
      dispatch(fetchLeaveTypeData(token));
    }
  }, [token, per_page, page, dispatch, loading, filters]);

  useEffect(() => {
    if (leaveData.pagination) {
      setPage(leaveData.pagination.page);
      setPer_page(leaveData.pagination.per_page);
      setTotal_page(leaveData.pagination.total_pages);
    }
  }, [leaveData.pagination]);

  // Define table columns
  const columns = [
    { Header: 'EMP Code', accessor: 'empCode' },
    { Header: 'User Name', accessor: 'full_name', sortable: true },
    { Header: 'Leave Reason', accessor: 'leaveReason', sortable: true },
    { Header: 'Leave Type', accessor: 'leaveName', sortable: true },
    { Header: 'Start Date', accessor: 'startDate', sortable: true },
    { Header: 'End Date', accessor: 'endDate', sortable: true },
    { Header: 'Days', accessor: 'leaveDays', sortable: true },
    { Header: 'Status', accessor: 'status', sortable: true },
  ];

  const dayOptions = [
    { label: 'First Half', value: 'First Half' },
    { label: 'Second Half', value: 'Second Half' },
    { label: 'Full Day', value: 'Full Day' },
  ]

  const statusOptions = [
    { value: 'Pending', label: 'Pending' },
    { value: 'Approved', label: 'Approved' },
    { value: 'Rejected', label: 'Rejected' },
  ];

  const leaveTypeOptions = leaveTypeData?.data?.map((leaveType) => ({
    value: leaveType.id,
    label: leaveType.name
  }));

  // Offcanvas content for 'edit', 'filter', and 'newLeave'
  const offcanvasContent = {
    edit: (
      <>
        <form>
          <div className="form-group mt-3">
            <label htmlFor="leaveReason">Leave Reason</label>
            <input className="form-control" type="text" id="leaveReason" placeholder='Leave Reason' value={formData.leaveReason} onChange={handleInputChange} required />
          </div>
          <div className="form-group py-2">
            <label htmlFor="leaveType">Leave Type</label>
            <SelectInput
              placeholder={'Select Leave Type'}
              value={leaveTypeOptions?.find(option => option.value == formData.leaveType)}
              onChange={(selectedOption) => { handleInputChange(selectedOption.value, 'leaveType') }}
              style={{ backgroundColor: '#EFF2F8' }}
              options={leaveTypeOptions}
            />
          </div>
          <div className="form-group">
            <label htmlFor="startDate">Start Date</label>
            <div className='form-control'>
              <DatePicker
                className='reactdatePicker'
                selected={formData.startDate || null}
                placeholderText='DD/MM/YYYY'
                onSelect={(date) => {
                  handleInputChange(date, 'startDate')
                  handleInputChange(null, 'endDate')
                }}
                onChange={(date) => {
                  handleInputChange(date, 'startDate')
                  handleInputChange(null, 'endDate')
                }}
                dateFormat="dd/MM/yyyy"
                clearButtonTitle={'Delete'}
                isClearable={true}
                clearButtonClassName='m-0 p-0 mx-5'
                onChangeRaw={() => {
                  handleInputChange('', 'startDate')
                  handleInputChange(null, 'endDate')
                }}
              />
            </div>
          </div>
          <div className="form-group py-2">
            <label htmlFor="leaveStartDay">Start Day</label>
            <SelectInput
              placeholder={'Select Start Day'}
              value={dayOptions.find(option => option.value === formData.leaveStartDay)}
              onChange={(selectedOption) => { handleInputChange(selectedOption.value, 'leaveStartDay') }}
              style={{ backgroundColor: '#EFF2F8' }}
              options={dayOptions}
            />
          </div>
          <div className="form-group py-2">
            <label htmlFor="emdDate">End Date</label>
            <div className='form-control'>
              <DatePicker
                className='reactdatePicker'
                selected={formData.endDate || null}
                placeholderText='DD/MM/YYYY'
                onSelect={(date) => handleInputChange(date, 'endDate')}
                onChange={(date) => handleInputChange(date, 'endDate')}
                dateFormat="dd/MM/yyyy"
                clearButtonTitle={'Delete'}
                isClearable={true}
                clearButtonClassName='m-0 p-0 mx-5'
                onChangeRaw={() => handleInputChange('', 'endDate')}
                minDate={formData.startDate}
                disabled={!(formData.startDate)}
              />
            </div>
          </div>
          <div className="form-group py-2">
            <label htmlFor="leaveEndDay">End Day</label>
            <SelectInput
              placeholder={'Select Start Day'}
              value={dayOptions.find(option => option.value === formData.leaveEndDay)}
              onChange={(selectedOption) => { handleInputChange(selectedOption.value, 'leaveEndDay') }}
              style={{ backgroundColor: '#EFF2F8' }}
              options={dayOptions}
            />
          </div>
        </form>
      </>
    ),
    filter: (
      <>
        <div className="form-group py-2">
          <label>Leave Status</label>
          <SelectInput
            placeholder="Select Option"
            value={statusOptions.find(opt => opt.value === filters?.status) || null}
            onChange={(selected) => handleFilterChange('status', selected?.value ?? null)}
            options={statusOptions}
          />
        </div>
        <div className='col-lg-12 mt-2'>
          <div className='col-md-12'>
            <label>From</label>
            <div className='form-control'>
              <DatePicker
                className='reactdatePicker'
                selected={filters.fromDate ? new Date(filters.fromDate) : null}
                onChange={(date) => handleDateChange(date, 'fromDate')}
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
                selected={filters?.toDate ? new Date(filters.toDate) : null}
                onChange={(date) => handleDateChange(date, 'toDate')}
                dateFormat="dd/MM/yyyy"
                placeholderText="DD/MM/YYYY"
                isClearable
                clearButtonClassName='m-0 p-0 mx-5'
              />
            </div>
          </div>
        </div>
      </>
    ),
    newLeave: (
      <>
        <form>
          <div className="form-group mt-3">
            <label htmlFor="leaveReason">Leave Reason</label>
            <input className="form-control" type="text" id="leaveReason" placeholder='Leave Reason' value={formData.leaveReason} onChange={handleInputChange} required />
          </div>
          <div className="form-group py-2">
            <label htmlFor="leaveType">Leave Type</label>
            <SelectInput
              placeholder={'Select Leave Type'}
              value={leaveTypeOptions?.find(option => option.value == formData.leaveType)}
              onChange={(selectedOption) => { handleInputChange(selectedOption.value, 'leaveType') }}
              style={{ backgroundColor: '#EFF2F8' }}
              options={leaveTypeOptions}
            />
          </div>
          <div className="form-group">
            <label htmlFor="startDate">Start Date</label>
            <div className='form-control'>
              <DatePicker
                className='reactdatePicker'
                selected={formData.startDate || null}
                placeholderText='DD/MM/YYYY'
                onSelect={(date) => {
                  handleInputChange(date, 'startDate')
                  handleInputChange(null, 'endDate')
                }}
                onChange={(date) => {
                  handleInputChange(date, 'startDate')
                  handleInputChange(null, 'endDate')
                }}
                dateFormat="dd/MM/yyyy"
                clearButtonTitle={'Delete'}
                isClearable={true}
                clearButtonClassName='m-0 p-0 mx-5'
                onChangeRaw={() => {
                  handleInputChange('', 'startDate')
                  handleInputChange(null, 'endDate')
                }}
              />
            </div>
          </div>
          <div className="form-group py-2">
            <label htmlFor="leaveStartDay">Start Day</label>
            <SelectInput
              placeholder={'Select Start Day'}
              value={dayOptions.find(option => option.value === formData.leaveStartDay)}
              onChange={(selectedOption) => { handleInputChange(selectedOption.value, 'leaveStartDay') }}
              style={{ backgroundColor: '#EFF2F8' }}
              options={dayOptions}
            />
          </div>
          <div className="form-group py-2">
            <label htmlFor="emdDate">End Date</label>
            <div className='form-control'>
              <DatePicker
                className='reactdatePicker'
                selected={formData.endDate || null}
                placeholderText='DD/MM/YYYY'
                onSelect={(date) => handleInputChange(date, 'endDate')}
                onChange={(date) => handleInputChange(date, 'endDate')}
                dateFormat="dd/MM/yyyy"
                clearButtonTitle={'Delete'}
                isClearable={true}
                clearButtonClassName='m-0 p-0 mx-5'
                onChangeRaw={() => handleInputChange('', 'endDate')}
                minDate={formData.startDate}
                disabled={!(formData.startDate)}
              />
            </div>
          </div>
          <div className="form-group py-2">
            <label htmlFor="leaveEndDay">End Day</label>
            <SelectInput
              placeholder={'Select Start Day'}
              value={dayOptions.find(option => option.value === formData.leaveEndDay)}
              onChange={(selectedOption) => { handleInputChange(selectedOption.value, 'leaveEndDay') }}
              style={{ backgroundColor: '#EFF2F8' }}
              options={dayOptions}
            />
          </div>
        </form>
      </>
    ),
  };

  useEffect(() => {
    localStorage.setItem('leaveFilter', JSON.stringify(filters));
  }, [filters]);

  return (
    <Layout>
      <section className="section">

        <div className="row mb-3">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', alignContent: 'center' }}>
            <h3 className='mb-0'>Leave</h3>
            <div>
              {permissionData?.leave?.canAddLeave &&
                <button
                  type="button"
                  className="btn mx-1 mt-0"
                  onClick={handleNewLeave} // Open new leave offcanvas
                  style={{ color: '#338db5', border: '1px solid #338db5' }}
                >
                  <i className="fa-solid fa-circle-plus"></i>&nbsp;Leave
                </button>
              }
              <button
                type="button"
                className="btn mx-1 mt-0"
                onClick={handleFilterClick} // Open filters offcanvas
                style={{ color: '#338db5', border: '1px solid #338db5',
                  backgroundColor: bgFilter ? '#dbf4ff' : 'transparent'
                 }}
              >
                <i className="fa-solid fa-bars"></i>&nbsp;Filters
              </button>
            </div>
          </div>
        </div>

        <div className='row'>
          <div className="col-lg-12">
            {loading ? <div>Loading...</div> : (
              <DataTable
                columns={columns}
                data={leaveData.data}
                pagination={leaveData.pagination}
                onClickPrevious={handlePreviousClick}
                onClickNext={handleNextClick}
                onPageSizeChange={handlePageSizeChange}
                onEdit={handleEdit}
                editButton={((row) => (row.empCode === empCode) || permissionData?.leave?.canUpdateLeave)} // Enable edit button
                deleteButton={((row) => (row.empCode === empCode) || permissionData?.leave?.canDeleteLeave)}
                onDelete={handleDelete}
                footer={true}
              />
            )}
          </div>
        </div>

      </section>

      {showOffcanvas && (
        <OffCanvas
          title={
            offcanvasType === 'edit'
              ? 'Update Leave'
              : offcanvasType === 'newLeave'
                ? 'Apply for Leave'
                : ''
          }
          content={offcanvasContent[offcanvasType]} // Dynamic content based on the offcanvas type
          onClose={handleCloseOffcanvas}
          handleSaveEdit={offcanvasType === 'edit' ? handleSaveEdit
            : offcanvasType === 'newLeave' ? handleSaveNewLeave
              : ''
          }
          handleCloseOffcanvas={handleCloseOffcanvas}
        />
      )}

      {showFilterOffcanvas && (
        <FilterOffCanvas
          title={'Leave'}
          content={offcanvasContent['filter']}
          onClose={handleCloseFilterOffcanvas}
          handleCloseOffcanvas={handleCloseFilterOffcanvas}
          handleClearAll={handleClearAll}
        />
      )}

    </Layout>
  );
}

export default Leave;