// src/Pages/TaskTimer.js

import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { useDispatch, useSelector } from 'react-redux';
import DataTable from '../Components/DataTable';
import Layout from '../Components/Layout';
import OffCanvas from '../Components/FilterOffCanvas';
import SelectInput from '../Components/SelectInput';
import { fetchTaskTimer, fetchUser, deleteTaskTimer, fetchTask } from '../redux/actions/taskTimerActions';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

function TaskTimer() {
  const [per_page, setPer_page] = useState(10);
  const [page, setPage] = useState(1);
  const [total_page, setTotal_page] = useState('');
  const dispatch = useDispatch();

  // Initialize filters from localStorage
  const initialFilter = () => {
    try {
      const filter = localStorage.getItem('TaskTimerFilter');
      return filter ? JSON.parse(filter) : {};
    } catch (error) {
      console.error('Error parsing TaskTimerFilter:', error);
      return {};
    }
  };

  const filter = initialFilter();
  const bgFilter = Object.values(filter).some(value => value != null && value !== '');

  const [filters, setFilters] = useState(() => {
    const stored = initialFilter();
    return {
      userId: stored.userId || null,
      taskCode: stored.taskCode || null,
      dateFrom: stored.dateFrom || '',
      dateTo: stored.dateTo || ''
    };
  });

  const { taskTimer, users, task } = useSelector((state) => state.taskTimer);

  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const logUser = localStorage.getItem('id');
  const [showFilterOffcanvas, setShowFilterOffcanvas] = useState(false);

  useEffect(() => {
    if (token) {
      let taskUser;
      if (role !== 'Admin') {
        taskUser = logUser;
      }
      const params = {
        per_page,
        page,
        taskUser,
        userId: filters.userId,
        taskCode: filters.taskCode,
        dateFrom: filters.dateFrom,
        dateTo: filters.dateTo
      };
      dispatch(fetchTaskTimer(token, params));
      dispatch(fetchUser(token));
      dispatch(fetchTask(token));
    } else {
      window.location.href = '/login';
    }
  }, [token, per_page, page, dispatch, filters]);

  useEffect(() => {
    localStorage.setItem('TaskTimerFilter', JSON.stringify(filters));
  }, [filters]);

  useEffect(() => {
    if (taskTimer.pagination) {
      setPage(taskTimer.pagination.page);
      setPer_page(taskTimer.pagination.per_page);
      setTotal_page(taskTimer.pagination.total_pages);
    }
  }, [taskTimer.pagination]);

  const handleDeleteUser = (taskTimer) => {
    Swal.fire({
      title: "Are you sure?",
      text: `You want to delete this Task Timer?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!"
    }).then(async (result) => {
      if (result.isConfirmed) {
        dispatch(deleteTaskTimer(taskTimer.id, token));
        dispatch(fetchTaskTimer(token, { per_page, page }));
        toast.success('Task timer deleted successfully');
      }
    });
  };

  const handleFilterChange = (selectedOption, filterName) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: selectedOption ? selectedOption.value : null
    }));
  };

  const handleFilterClick = () => {
    setShowFilterOffcanvas(true);
  };

  const handleClearAll = () => {
    setFilters({
      userId: null,
      taskCode: null,
      dateFrom: '',
      dateTo: ''
    });
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


  const columns = [
    { Header: 'Task', accessor: 'taskCode', },
    { Header: 'User', accessor: 'full_name', },
    { Header: 'Start Time', accessor: 'startTime', },
    { Header: 'End Time', accessor: 'endTime', },
    { Header: 'Duration', accessor: 'duration', },
    { Header: 'Message', accessor: 'message', },
  ];

  // Helper functions to get selected options
  const getSelectedUser = () => {
    const user = users?.data?.find(u => u.id === filters.userId);
    return user ? { value: user.id, label: `${user.empCode} - ${user.full_name} ` } : null;
  };

  const getSelectedTask = () => {
    const selectedTask = task?.data?.find(t => t.code === filters.taskCode);
    return selectedTask ? { value: selectedTask?.code, label: selectedTask?.code } : null;
  };

  return (
    <Layout>
      <section className="section">
        <div className="row mb-3">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', alignContent: 'center' }}>
            <h3 className='mb-0'>Task Timer</h3>
            <div>
              {role === 'Admin' && (
                <button
                  type="button"
                  className="btn mx-1 mt-0"
                  onClick={handleFilterClick}
                  style={{ color: '#338db5', border: '1px solid #338db5',
                    backgroundColor: bgFilter ? '#dbf4ff' : 'transparent'
                   }}
                >
                  <i className="fa-solid fa-bars"></i>&nbsp; Filters
                </button>
              )}
            </div>
          </div>
        </div>
        <div className='row'>
          <div className="col-lg-12">
            <DataTable
              columns={columns}
              data={taskTimer.data}
              pagination={taskTimer.pagination}
              onClickPrevious={handlePreviousClick}
              onClickNext={handleNextClick}
              onPageSizeChange={handlePageSizeChange}
              onDelete={handleDeleteUser}
              deleteButton={role === 'Admin'}
              footer={true}
            />
          </div>
        </div>

        {showFilterOffcanvas && (
          <OffCanvas
            title='Task Timer'
            content={
              <>
                <div className="form-group">
                  <label>User</label>
                  <SelectInput
                    placeholder={'Select Option'}
                    value={getSelectedUser()}
                    onChange={(option) => handleFilterChange(option, 'userId')}
                    options={users?.data?.map((user) => ({
                      value: user.id,
                      label: `${user.empCode} - ${user.full_name}`
                    }))}
                  />
                </div>

                <div className="form-group py-2">
                  <label>Task</label>
                  <SelectInput
                    placeholder={'Select Option'}
                    value={getSelectedTask()}
                    onChange={(option) => handleFilterChange(option, 'taskCode')}
                    options={task?.data?.map((task) => ({
                      value: task.code,
                      label: task.code
                    }))}
                  />
                </div>

                <div className='col-lg-12 mt-2'>
                  <div className='col-md-12'>
                    <label>From</label>
                    <div className='form-control'>
                      <DatePicker
                        className='reactdatePicker'
                        selected={filters?.dateFrom ? new Date(filters.dateFrom) : null}
                        onChange={(date) => handleDateChange(date, 'dateFrom')}
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
                        selected={filters?.dateTo ? new Date(filters.dateTo) : null}
                        onChange={(date) => handleDateChange(date, 'dateTo')}
                        dateFormat="dd/MM/yyyy"
                        placeholderText="DD/MM/YYYY"
                        isClearable
                        clearButtonClassName='m-0 p-0 mx-5'
                        minDate={filters?.dateFrom ? new Date(filters.dateFrom) : null}
                       
                      />
                    </div>
                  </div>
                </div>
              </>
            }
            onClose={() => setShowFilterOffcanvas(false)}
            handleClearAll={handleClearAll}
            handleCloseOffcanvas={() => setShowFilterOffcanvas(false)}
          />
        )}
      </section>
    </Layout>
  );
}

export default TaskTimer;