// src/Pages/PendingLeave

// import core module
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useSelector, useDispatch } from 'react-redux';
import DatePicker from "react-datepicker";

// import require components
import DataTable from '../Components/DataTable';
import { apiCall } from '../Components/API'; // API call utility
import Layout from '../Components/Layout';
import FilterOffCanvas from '../Components/FilterOffCanvas';
import SelectInput from '../Components/SelectInput';

import { fetchPendingLeaveData, fetchUser, fetchLeaveTypeData } from '../redux/actions/pendingLeaveActions';
import Swal from 'sweetalert2';

function PendingLeave() {
  const userId = localStorage.getItem('id');
  const token = localStorage.getItem('token');  // Get token from local storage
  if (!token) {
    window.location.href = '/login'; // Redirect if no token
  }

  const [showFilterOffcanvas, setShowFilterOffcanvas] = useState(false);

  const initialFilter = () => {
    try {
      const filter = localStorage.getItem('pendingLeaveFilter');
      return filter ? JSON.parse(filter) : {};
    } catch (error) {
      console.error('Error parsing pendingLeaveFilter:', error);
      return {};
    }
  };

  const filter = initialFilter();
  const bgFilter = Object.values(filter).some(value => value != null && value !== '');

  const [filters, setFilters] = useState(() => {
    const stored = initialFilter();
    return {
      user: stored.user || null,
      leaveType: stored.leaveType || null,
      dateFrom: stored.dateFrom || '',
      dateTo: stored.dateTo || ''
    };
  });

  const [per_page, setPer_page] = useState(10)
  const [page, setPage] = useState(1)
  const [total_page, setTotal_page] = useState('')

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
  const { pendingLeaveData, userData, leaveTypeData } = useSelector(
    (state) => state.pendingLeave
  );

  useEffect(() => {
    if (token) {  // Only fetch if we have a token and not already loading
      const params = {
        per_page,
        page,
        user: filters.user,
        leaveType: filters.leaveType,
        dateFrom: filters.dateFrom,
        dateTo: filters.dateTo
      }
      dispatch(fetchPendingLeaveData(token, params));
      dispatch(fetchUser(token));
      dispatch(fetchLeaveTypeData(token));
    }
  }, [token, per_page, page, dispatch, filters]);

  useEffect(() => {
    if (pendingLeaveData.pagination) {
      setPage(pendingLeaveData.pagination.page);
      setPer_page(pendingLeaveData.pagination.per_page);
      setTotal_page(pendingLeaveData.pagination.total_pages);
    }
  }, [pendingLeaveData.pagination]);

  // Define table columns
  const columns = [
    { Header: 'EMP Code', accessor: 'empCode', sortable: true },
    { Header: 'User Name', accessor: 'full_name', sortable: true },
    { Header: 'Leave Reason', accessor: 'leaveReason', sortable: true },
    { Header: 'Leave Type', accessor: 'leaveName', sortable: true },
    { Header: 'Start Date', accessor: 'startDate', sortable: true },
    { Header: 'End Date', accessor: 'endDate', sortable: true },
    { Header: 'Days', accessor: 'leaveDays', sortable: true },
  ];

  // Handle edit button click
  const handleApprove = async (leave) => {
    Swal.fire({
      title: "Are you sure?",
      text: `You want to Approve this leave?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, Update it!"
    }).then(async (result) => {
      if (result.isConfirmed) {
        const response = await apiCall('leave/approvePendingLeave', token, 'POST', { id: leave.id, user: userId });
        toast.success(`Leave approved Successfull`)
        dispatch(fetchPendingLeaveData(token, per_page, page));
      }
    })
  };

  const handleReject = async (leave) => {
    Swal.fire({
      title: "Are you sure?",
      text: `You want to Reject this leave?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, Update it!"
    }).then(async (result) => {
      if (result.isConfirmed) {
        const response = await apiCall('leave/rejectPendingLeave', token, 'POST', { id: leave.id, user: userId });
        toast.success(`Leave Rejected`)
        dispatch(fetchPendingLeaveData(token, per_page, page));
      }
    })
  };

  // Close offcanvas
  const handleCloseOffcanvas = () => {
    setShowFilterOffcanvas(false);
  };

  // Show filter offcanvas
  const handleFilterClick = () => {
    setShowFilterOffcanvas(true);
  };

  const handleDateChange = (date, field) => {
    if (field === 'dateFrom') {
      const updatedFilters = {
        ...filters,
        dateFrom: date,
      };
  
      // Only clear To date if it exists and is before the new From date
      if (filters.dateTo && date && new Date(date) > new Date(filters.dateTo)) {
        updatedFilters.dateTo = null;
      }
  
      setFilters(updatedFilters);
    } else if (field === 'dateTo') {
      setFilters({
        ...filters,
        dateTo: date,
      });
    }
  };

  // Helper functions to get selected options
  const getSelectedUser = () => {
    const user = userData?.data?.find(u => u.empCode === filters.user);
    return user ? { value: user.empCode, label: `${user.empCode} - ${user.full_name} ` } : null;
  };

  const getSelectedLeaveType = () => {
    const selectedLeaveType = leaveTypeData?.data?.find(t => t.id === filters.leaveType);
    return selectedLeaveType ? { value: selectedLeaveType?.id, label: selectedLeaveType?.name } : null;
  };

  useEffect(() => {
    localStorage.setItem('pendingLeaveFilter', JSON.stringify(filters));
  }, [filters]);

  return (
    <Layout>
      <section className="section">
        <div className="row mb-3">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', alignContent: 'center' }}>
            <h3>Pending Leave</h3>
            <div>
              <button
                type="button"
                className="btn mx-1 mt-0"
                onClick={handleFilterClick} // Show filter offcanvas
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
            <DataTable
              columns={columns}
              data={pendingLeaveData.data}
              pagination={pendingLeaveData.pagination}
              onClickPrevious={handlePreviousClick}
              onClickNext={handleNextClick}
              onPageSizeChange={handlePageSizeChange}
              onApprove={handleApprove}
              approveButton={true}
              onReject={handleReject}
              rejectButton={true}
              footer={true}
            />
          </div>
        </div>

      </section>

      {/* Offcanvas Component */}
      {showFilterOffcanvas && (
        <FilterOffCanvas
          title={'Pending Leave'}
          content={
            <>
              <div className='pb-2'>
                <label>Select User</label>
                <SelectInput
                  placeholder="Select User"
                  value={getSelectedUser()} // This binds the value to the state
                  onChange={(e) =>
                    setFilters({ ...filters, user: e?.value }) // Update status in the filter state
                  }
                  options={userData?.data?.map((user) => ({
                    value: user.empCode,
                    label: `${user.empCode} - ${user.full_name}`
                  }))}
                />
              </div>
              <div className='py-2'>
                <label>Select Leave Type</label>
                <SelectInput
                  placeholder="Select Leave Type"
                  value={getSelectedLeaveType()} // This binds the value to the state
                  onChange={(e) =>
                    setFilters({ ...filters, leaveType: e?.value }) // Update leave type in the filter state
                  }
                  options={leaveTypeData?.data?.map((leaveType) => ({
                    value: leaveType.id,
                    label: leaveType.name
                  }))}
                />
              </div>
              <div className="form-group">
                <label>From</label>
                <div className='form-control'>
                  <DatePicker
                    className='reactdatePicker'
                    selected={filters.dateFrom ? new Date(filters.dateFrom) : null}
                    onChange={(date) => handleDateChange(date, 'dateFrom')}
                    dateFormat="dd/MM/yyyy"
                    placeholderText="DD/MM/YYYY"
                    isClearable
                    clearButtonClassName='m-0 p-0 mx-5'
                  />
                </div>
                <label>To</label>
                <div className='form-control'>
                  <DatePicker
                    className='reactdatePicker'
                    selected={filters.dateTo ? new Date(filters.dateTo) : null}
                    onChange={(date) => handleDateChange(date, 'dateTo')}
                    dateFormat="dd/MM/yyyy"
                    placeholderText="DD/MM/YYYY"
                    isClearable
                    clearButtonClassName='m-0 p-0 mx-5'
                  />
                </div>
              </div>
            </>
          }
          onClose={handleCloseOffcanvas}
          handleCloseOffcanvas={handleCloseOffcanvas}
          handleClearAll={(e) => setFilters({ user: null, leaveType: null, dateFrom: '', dateTo: '' })}
        />
      )}
    </Layout>
  );
}

export default PendingLeave;