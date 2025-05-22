// src/Pages/Regularization.js

// import core module
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { useSelector, useDispatch } from 'react-redux';

// import require components
import Layout from '../Components/Layout';
import DataTable from '../Components/DataTable';
import FilterOffCanvas from '../Components/FilterOffCanvas';
import SelectInput from '../Components/SelectInput';
import { apiCall } from '../Components/API';

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import { fetchRegularizationData, fetchUserData } from '../redux/actions/regularizationActions';

function Regularization() {
  // Initialize filter from localStorage or use empty object if not exists
  const initialFilter = () => {
    try {
      const filter = localStorage.getItem('regularizationFilter');
      return filter ? JSON.parse(filter) : {};
    } catch (error) {
      console.error('Error parsing regularizationFilter:', error);
      return {};
    }
  };

  const filter = initialFilter();
  const bgFilter = Object.values(filter).some(value => value != null && value !== '');

  // State declarations
  const [showFilterOffcanvas, setShowFilterOffcanvas] = useState(false);
  const [per_page, setPer_page] = useState(10)
  const [page, setPage] = useState(1)
  const [total_page, setTotal_page] = useState('')
  const [filters, setFilters] = useState(() => {
    const init = initialFilter();
    return {
      user: init.user || null,
      status: init.status || null,
      fromDate: init.fromDate || '',
      toDate: init.toDate || ''
    };
  });

  const id = localStorage.getItem('id');
  const token = localStorage.getItem('token');

  // Status options for filter
  const statusOptions = [
    { value: 'Pending', label: 'Pending' },
    { value: 'Approved', label: 'Approved' },
    { value: 'Rejected', label: 'Rejected' }
  ];

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
  const { regularizationData, userData, loading } = useSelector(
    (state) => state.regularization
  );

  useEffect(() => {
    if (token && !loading) {  // Only fetch if we have a token and not already loading
      let filterParams = {
        user : filters.user,
        status : filters.status,
        fromDate : filters.fromDate,
        toDate : filters.toDate
      }
      dispatch(fetchRegularizationData(token, per_page, page, filterParams));
      dispatch(fetchUserData(token));
    }
  }, [token, per_page, page, dispatch, loading, filters]);

  useEffect(() => {
    if (regularizationData.pagination) {
      setPage(regularizationData.pagination.page);
      setPer_page(regularizationData.pagination.per_page);
      setTotal_page(regularizationData.pagination.total_pages);
    }
  }, [regularizationData.pagination]);

  // Filter handlers
  const handleFilterClick = () => {
    setShowFilterOffcanvas(true);
  };

  const handleApplyFilters = () => {
  };

  const handleClearAll = () => {
    setFilters({
      user: null,
      status: null,
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

  const handleCloseFilterOffcanvas = () => {
    setShowFilterOffcanvas(false); // Properly close offcanvas
  };

  const handleApprove = async (regularization) => {
    const data = { approveId: id, time: regularization.punchTime, userId: regularization.userId, date: regularization.date };
    try {
      Swal.fire({
        title: "Are you sure?",
        text: `You want to Accept this Regularization?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, Accept it!"
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            const response = await apiCall(`attendance/regularization/approveByID/${regularization.id}`, token, 'POST', data);
            toast.success(response.message);
            dispatch(fetchRegularizationData(token, per_page, page));
          } catch (error) {
            toast.error(error.message || 'Failed to Accept regularization');
            console.error(error);
          }
        }
      });

    } catch (error) {
      toast.error(error.message || 'Failed to approve regularization');
      console.error(error);
    }
  };

  const handleReject = async (regularization) => {
    const data = { userID: id };
    Swal.fire({
      title: "Are you sure?",
      text: `You want to reject this Regularization?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, Reject it!"
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await apiCall(`attendance/regularization/rejectByID/${regularization.id}`, token, 'POST', data);
          toast.success(response.message);
          dispatch(fetchRegularizationData(token, per_page, page));
        } catch (error) {
          toast.error(error.message || 'Failed to reject regularization');
          console.error(error);
        }
      }
    });
  };

  // Columns definition
  const columns = [
    { Header: 'User', accessor: 'full_name', sortable: true },
    { Header: 'Date', accessor: 'date', sortable: true },
    { Header: 'Punch Time', accessor: 'punchTime', sortable: true },
    { Header: 'Reason', accessor: 'reason', sortable: true },
    { Header: 'Remarks', accessor: 'remarks', sortable: true },
    { Header: 'Status', accessor: 'status', sortable: true }
  ];

  const getSelectedUser = () => {
    const user = userData?.data?.find(u => u.id === filters.user);
    return user ? { value: user.id, label: user.full_name } : null;
  };

  const getSelectedStatus = () => {
    const user = statusOptions.find(u => u.value === filters.status);
    return user || null;
  };

  useEffect(() => {
      localStorage.setItem('regularizationFilter', JSON.stringify(filters));
    }, [filters]);

  return (
    <Layout>
      <section className="section">
        <div className="row mb-3">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
            <h3 className='mb-0'>Regularization</h3>
            <div>
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
            </div>
          </div>
        </div>

        <div className='row'>
          <div className="col-lg-12">
            <DataTable
              columns={columns}
              data={regularizationData?.data}
              pagination={regularizationData?.pagination}
              onClickPrevious={handlePreviousClick}
              onClickNext={handleNextClick}
              onPageSizeChange={handlePageSizeChange}
              approveButton={(row) => row.status === 'Pending'}
              onApprove={handleApprove}
              rejectButton={(row) => row.status === 'Pending'}
              onReject={handleReject}
              footer={true}
            />
          </div>
        </div>
      </section>

      {showFilterOffcanvas &&
        <FilterOffCanvas
          title='Regularization'
          content={
            <>
              <div className="form-group">
                <label>Status</label>
                <SelectInput
                  placeholder={'Select Status'}
                  value={getSelectedStatus()}
                  onChange={(option) => handleFilterUpdate(option?.value ? option.value : null, 'status')}
                  options={statusOptions}
                />
              </div>
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
              <div className='col-lg-12 mt-2'>
                <div className='col-md-12'>
                  <label>From</label>
                  <div className='form-control'>
                    <DatePicker
                      className='reactdatePicker'
                      selected={filters.fromDate ? new Date(filters.fromDate) : null}
                      onChange={(date) => handleFilterUpdate(date, 'fromDate', 'date')}
                      dateFormat="dd/MM/yyyy"
                      placeholderText="Select start date"
                      clearButtonTitle={'Clear'}
                      isClearable={true}
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
                      placeholderText="Select end date"
                      clearButtonTitle={'Clear'}
                      isClearable={true}
                      clearButtonClassName='m-0 p-0 mx-5'
                    />
                  </div>
                </div>
              </div>
            </>
          }
          onClose={handleCloseFilterOffcanvas}
          handleCloseOffcanvas={handleCloseFilterOffcanvas}
          handleClearAll={handleClearAll}
          handleApplyFilters={handleApplyFilters}
        />
      }
    </Layout>
  );
}

export default Regularization;