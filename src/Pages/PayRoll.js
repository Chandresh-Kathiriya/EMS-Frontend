// src/Pages/Settings.js

// import core module
import React, { useCallback, useContext, useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

// import require component
import Layout from '../Components/Layout';
import { PermissionContext } from '../Context/PermissionContext';
import DataTable from '../Components/DataTable';
import OffCanvas from '../Components/OffCanvas';
import FilterOffCanvas from '../Components/FilterOffCanvas';
import DatePicker from 'react-datepicker';

import { fetchPayRollData, fetchUserData, fireCronManually, updateStatus } from '../redux/actions/payRollAction';
import SelectInput from '../Components/SelectInput';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';

const PayRoll = () => {
  const token = localStorage.getItem('token')
  const { permissionData } = useContext(PermissionContext);
  const [showOffcanvas, setShowOffcanvas] = useState(false)
  const [showFilterOffcanvas, setShowFilterOffcanvas] = useState(false)
  const [filters, setFilters] = useState({})
  const [calculateForm, setCalculateForm] = useState({})
  const [tempForm, setTempForm] = useState({})
  const [per_page, setPer_page] = useState(10)
  const [page, setPage] = useState(1)
  const [total_page, setTotal_page] = useState('')

  const columns = [
    { Header: 'User Name', accessor: 'full_name' },
    { Header: 'Month', accessor: 'month' },
    { Header: 'Official Days', accessor: 'officialWorkingDays' },
    { Header: 'User Work Days', accessor: 'actualWorkingDays' },
    { Header: 'Leave', accessor: 'leave' },
    { Header: 'Salary', accessor: 'baseSalary' },
    { Header: 'Deduction', accessor: 'deduction' },
    { Header: 'Payable Salary', accessor: 'payable' },
  ]

  const dispatch = useDispatch();
  const { payRollData, userData, fireCron } = useSelector(
    (state) => state.payRoll
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

  const handleFilterChange = useCallback((value, filterName, type = 'text') => {
    let parsedValue;

    if (type === 'date') {
      parsedValue = value instanceof Date ? value.toISOString() : '';
    } else if (type === 'select') {
      parsedValue = value?.value || '';
    } else if (type === 'text') {
      parsedValue = value?.target?.value || '';
    } else {
      parsedValue = value || '';
    }

    setFilters((prevFilters) => ({
      ...prevFilters,
      [filterName]: parsedValue,
    }));
  }, []);

  const handleFilter = () => {
    setShowFilterOffcanvas(true)
  }

  const handleCalculate = () => {
    setShowOffcanvas(true)
  }

  const handleFilterCloseOffcanvas = () => {
    setShowFilterOffcanvas(false)
  }

  const handleCloseOffcanvas = () => {
    setShowOffcanvas(false)
  }

  const handleClearAll = () => {
    setFilters({})
  }

  const handleTempUpdate = (value, field, type = 'default') => {
    const formattedValue = type === 'date' && value instanceof Date
      ? value.toISOString()
      : value;

    setTempForm((prev) => ({
      ...prev,
      [field]: formattedValue,
    }));
  };

  const handleCalculateClick = () => {
    setCalculateForm({ ...tempForm });
    setShowOffcanvas(false)
  };

  const handleStatusApprove = (row) => {
    Swal.fire({
      title: "Are you sure?",
      text: `You want to mark as Paid this?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, Update it!"
    }).then(async (result) => {
      if (result.isConfirmed) {
        const data = { status: 'Paid', id: row.id }
        const result = await dispatch(updateStatus(token, data))
        toast.success('Status marked as Approved!!!')
        const params = {
          ...calculateForm,
          page,
          per_page,
          ...filters
        };
        dispatch(fetchPayRollData(token, params));
      }
    })
  }

  const handleStatusReject = (row) => {
    Swal.fire({
      title: "Are you sure?",
      text: `You want to mark as Unpaid this!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, Update it!"
    }).then(async (result) => {
      if (result.isConfirmed) {
        const data = { status: 'Unpaid', id: row.id }
        const result = await dispatch(updateStatus(token, data))
        toast.success('Status marked as Unpaid!!!')
        const params = {
          ...calculateForm,
          page,
          per_page,
          ...filters
        };
        dispatch(fetchPayRollData(token, params));
      }
    })
  }

  const userOptions = userData?.data?.map(user => ({
    value: user.id,
    label: user.full_name
  }));

  const statusOptions = [
    { label: 'Pending', value: 'Pending' },
    { label: 'Paid', value: 'Paid' },
    { label: 'Unpaid', value: 'Unpaid' }
  ]

  const offcanvasContent = {
    filter: (
      <>
        <form>
          <div className="form-group pb-2">
            <label>User</label>
            <SelectInput
              placeholder={'Select User'}
              value={userOptions?.find(u => u.value === filters.user) || null}
              onChange={(option) => handleFilterChange(option, 'user', 'select')}
              options={userOptions}
            />
          </div>
          <div className='row d-flex'>
            <div className='col-md-6 pb-2 pe-1'>
              <label>Start Month</label>
              <div className='form-control'>
                <DatePicker
                  className='reactdatePicker'
                  selected={filters.startDate ? new Date(filters.startDate) : null}
                  onChange={(date) => {
                    if (date) {
                      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
                      if (filters.endDate && new Date(filters.endDate) < startOfMonth) {
                        handleFilterChange(null, 'endDate', 'date');
                      }
                      handleFilterChange(startOfMonth, 'startDate', 'date');
                    } else {
                      handleFilterChange(null, 'startDate', 'date');
                    }
                  }}
                  dateFormat="MM/yyyy"
                  showMonthYearPicker
                  placeholderText="Select start month"
                  isClearable
                  clearButtonClassName='m-0 p-0 mx-2'
                />
              </div>
            </div>
            <div className='col-md-6 pb-2 ps-1'>
              <label>End Month</label>
              <div className='form-control'>
                <DatePicker
                  className='reactdatePicker'
                  selected={filters.endDate ? new Date(filters.endDate) : null}
                  onChange={(date) => {
                    if (date) {
                      // Set to last day of selected month
                      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
                      handleFilterChange(endOfMonth, 'endDate', 'date');
                    } else {
                      handleFilterChange(null, 'endDate', 'date');
                    }
                  }}
                  dateFormat="MM/yyyy"
                  showMonthYearPicker
                  placeholderText="Select end month"
                  isClearable
                  clearButtonClassName='m-0 p-0 mx-2'
                  minDate={filters.startDate ? new Date(filters.startDate) : null}
                />
              </div>
            </div>
          </div>

          <div className="form-group pb-2">
            <label>Status</label>
            <SelectInput
              placeholder={'Select Status'}
              value={statusOptions?.find(u => u.value === filters.status) || null}
              onChange={(option) => handleFilterChange(option, 'status', 'select')}
              options={statusOptions}
            />
          </div>
        </form>
      </>
    ),
    calculate: (
      <>
        <form>
          <div className='col-md-12 mt-3'>
            <div className="form-group">
              <label>User</label>
              <SelectInput
                placeholder={'Select User'}
                value={userOptions?.find(u => u.value === tempForm.user) || null}
                onChange={(option) => handleTempUpdate(option?.value || null, 'user')}
                options={userOptions}
              />
            </div>
          </div>

          <div className='col-md-12 mt-2'>
            <label>Select Month</label>
            <div className='form-control'>
              <DatePicker
                className='reactdatePicker'
                selected={tempForm?.fromDate ? new Date(tempForm.fromDate) : null}
                onChange={(date) => handleTempUpdate(date, 'fromDate', 'date')}
                dateFormat="MM/yyyy"
                showMonthYearPicker
                placeholderText="MM/YYYY"
                isClearable
                clearButtonClassName='m-0 p-0 mx-5'
              />
            </div>
          </div>

          <div className="text-center mt-3">
            <button
              type="button"
              className="btn bgnone mx-1 w-25"
              onClick={handleCalculateClick}
              style={{ color: '#338db5', border: '1px solid #338db5' }}
            >
              Calculate
            </button>
            <button
              type="button"
              className="btn bgnone mx-1 w-25"
              onClick={() => {
                setCalculateForm({});
                setTempForm({});
              }}
              style={{ color: '#fd6f6f', border: '1px solid #fd6f6f' }}
            >
              Clear All
            </button>
          </div>
        </form>
      </>
    )
  }

  useEffect(() => {
    if (token) {
      dispatch(fetchUserData(token));
    }
  }, [token, dispatch]);

  useEffect(() => {
    const params = {
      ...calculateForm,
      page,
      per_page,
      ...filters
    };

    if (token) {
      dispatch(fetchPayRollData(token, params));
    }
  }, [token, per_page, page, calculateForm, filters, dispatch]);

  useEffect(() => {
    if (payRollData.pagination) {
      setPage(payRollData.pagination.page);
      setTotal_page(payRollData.pagination.total_pages);
    }
  }, [payRollData.pagination]);

  return (
    <Layout>
      <section className="section">
        <div className="row mb-3">
          <div className="pagetitle d-flex justify-content-between align-items-center flex-wrap m-0">
            <h1 className="mb-0">Pay Roll Report</h1>

            <div className="d-flex">
              <button
                type="button"
                className="btn mx-1 mt-0"
                onClick={async () => {
                  try {
                    const response = await dispatch(fireCronManually()); // unwrap for payload
                    const params = { page, per_page }
                    dispatch(fetchPayRollData(token, params));
                    toast.success(response?.message || 'Cron executed successfully!');
                  } catch (error) {
                    toast.error(error?.message || 'Failed to execute cron.');
                  }
                }}
                style={{ color: '#338db5', border: '1px solid #338db5' }}
              >
                <i className="fa-solid fa-sync"></i>&nbsp;Cron Fire
              </button>
              <button
                type="button"
                className="btn mx-1 mt-0"
                onClick={handleFilter}
                style={{ color: '#338db5', border: '1px solid #338db5' }}
              >
                <i className="fa-solid fa-bars"></i>&nbsp;Filters
              </button>
              <button
                type="button"
                className="btn mx-1 mt-0"
                onClick={handleCalculate}
                style={{ color: '#338db5', border: '1px solid #338db5' }}
              >
                <i className="fa-solid fa-calculator"></i>&nbsp;Calculate
              </button>
            </div>
          </div>
        </div>

        <div className='row'>
          <div className="col-lg-12">
            <DataTable
              columns={columns}
              data={payRollData?.data}
              pagination={payRollData?.pagination}
              onClickPrevious={handlePreviousClick}
              onClickNext={handleNextClick}
              onPageSizeChange={handlePageSizeChange}
              approveButton={(row) => row.status === 'Pending'}
              rejectButton={(row) => row.status === 'Pending'}
              displayText={(row) => row.status !== 'Pending' ? row.status : null}
              onApprove={(row) => handleStatusApprove(row)}
              onReject={(row) => handleStatusReject(row)}
              ApproveText={'Paid'}
              RejectText={'Unpaid'}
              footer={true}
            />
          </div>
        </div>
      </section>

      {showOffcanvas && (
        <OffCanvas
          title={'Calculate Salary'}
          content={offcanvasContent['calculate']}
          onClose={handleCloseOffcanvas}
          handleCloseOffcanvas={handleCloseOffcanvas}
          saveButton={false}
          cancelButton={false}
        />
      )}

      {showFilterOffcanvas && (
        <FilterOffCanvas
          title={'Pay Roll'}
          content={offcanvasContent['filter']}
          onClose={handleFilterCloseOffcanvas}
          handleCloseOffcanvas={handleFilterCloseOffcanvas}
          handleClearAll={handleClearAll}
        />
      )}

    </Layout>
  );
};

export default PayRoll;