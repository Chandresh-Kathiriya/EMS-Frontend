// src/Pages/Holidays.js

// Import core modules
import React, { useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useSelector, useDispatch } from 'react-redux';
import Swal from 'sweetalert2';
import DatePicker from "react-datepicker";
import { PermissionContext } from '../Context/PermissionContext';

// Import Components for page
import DataTable from '../Components/DataTable';
import Layout from '../Components/Layout';
import OffCanvas from '../Components/OffCanvas';
import FilterOffCanvas from '../Components/FilterOffCanvas';
import { apiCall } from '../Components/API';

import { fetchHolidayData } from '../redux/actions/holidayActions';

function Holidays() {
  const { permissionData } = useContext(PermissionContext);
  // Check token is available in localstorage
  const token = localStorage.getItem('token');
  // if (!token) {
  //   window.location.href = '/login';
  // }

  const role = localStorage.getItem('role');
  if (!role) {
    window.location.href = '/login';
  }

  const [selectedHoliday, setSelectedHoliday] = useState(null);
  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const [showFilterOffcanvas, setShowFilterOffcanvas] = useState(false);
  const [offcanvasType, setOffcanvasType] = useState('');
  const [per_page, setPer_page] = useState(10)
  const [page, setPage] = useState(1)
  const [total_page, setTotal_page] = useState('')
  const [newHoliday, setNewHoliday] = useState({
    name: '',
    startDate: '',
    endDate: '',
  })
  const initialFilter = () => {
    try {
      const weekOff = localStorage.getItem('holidayFilter');
      return weekOff ? JSON.parse(weekOff) : {};
    } catch (error) {
      console.error('Error parsing holidayFilter:', error);
      return {};
    }
  };

  const filter = initialFilter();
  const bgFilter = Object.values(filter).some(value => value != null && value !== '');

  const [filters, setFilters] = useState(() => {
    const init = initialFilter();
    return {
      fromDate: init.fromDate || null,
      toDate: init.toDate || null
    };
  });

  const handleHolidayChange = (e) => {
    const { name, value } = e.target;
    setNewHoliday((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleFilterUpdate = (value, filterName) => {
    let processedValue;

    if (value) {
      const year = value.getFullYear();
      const month = String(value.getMonth() + 1).padStart(2, '0');
      const day = String(value.getDate()).padStart(2, '0');
      processedValue = `${year}-${month}-${day}`;
    } else {
      processedValue = '';
    }

    setFilters(prev => ({
      ...prev,
      [filterName]: processedValue
    }));
  };

  const handleCloseOffcanvas = () => {
    setShowOffcanvas(false); // Close the offcanvas modal
    setSelectedHoliday(null); // Reset the selected holiday
  };

  const handleCloseFilterOffcanvas = () => {
    setShowFilterOffcanvas(false);
  }

  const handleSaveEdit = async () => {
    if (!selectedHoliday.name || !selectedHoliday.startDate || !selectedHoliday.endDate) {
      toast.error('Please provide all details to create holiday !!!')
    } else {
      const data = {
        name: selectedHoliday.name,
        startDate: selectedHoliday.startDate,
        endDate: selectedHoliday.endDate
      }
      try {
        const response = await apiCall(`master/updateHoliday/${selectedHoliday.id}`, token, 'POST', data);
        toast.success(response.message)
        setShowOffcanvas(false); // Close the offcanvas after adding
      } catch (error) {
        console.log(error)
      }
    }
  };

  const handleAddHoliday = async () => {
    if (!newHoliday.name || !newHoliday.startDate) {
      toast.error('Please provide all details to create holiday !!!')
    } else {
      try {
        const response = await apiCall('master/addHoliday', token, 'POST', newHoliday);
        toast.success(response.message)
        setShowOffcanvas(false); // Close the offcanvas after adding
        const params = {page, per_page}
        dispatch(fetchHolidayData(token, params));
      } catch (error) {
        console.log(error)
      }
    }
  };


  const offcanvasContent = {
    filter: (
      <>
        <div className='row'>
          <div className='col-md-12'>
            <div className="form-group">
              <label>From</label>
              <div className='form-control'>
                <DatePicker
                  className='reactdatePicker'
                  selected={filters.fromDate ? new Date(filters.fromDate) : null}
                  onChange={(date) => handleFilterUpdate(date, 'fromDate')}
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
                  selected={filters.toDate ? new Date(filters.toDate) : null}
                  onChange={(date) => handleFilterUpdate(date, 'toDate')}
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
    new: (
      <>
        <form>
          <div className="form-group py-2">
            <label>Holiday Name</label>
            <input
              type="text"
              className="form-control"
              placeholder="Enter Holiday Name"
              name='name'
              value={newHoliday.name}
              onChange={handleHolidayChange}
            />
          </div>
          <div className="form-group py-2">
            <label>Start Date</label>
            <input
              type="date"
              name='startDate'
              className="form-control"
              value={newHoliday.startDate}
              onChange={handleHolidayChange}
            />
          </div>
          <div className="form-group py-2">
            <label>End Date</label>
            <input
              type="date"
              name='endDate'
              className="form-control"
              value={newHoliday.endDate}
              onChange={handleHolidayChange}
            />
          </div>
        </form>
      </>
    ),
    edit: (
      <>
        <form>
          <div className="form-group py-2">
            <label>Holiday Name</label>
            <input
              type="text"
              className="form-control"
              placeholder="Enter Holiday Name"
              value={selectedHoliday?.name || ''} // Prefill with selected holiday's name
              onChange={(e) => setSelectedHoliday({ ...selectedHoliday, name: e.target.value })}
            />
          </div>
          <div className="form-group py-2">
            <label>Start Date</label>
            <input
              type="date"
              className="form-control"
              value={selectedHoliday?.startDate || ''} // Prefill with selected holiday's startDate
              onChange={(e) => setSelectedHoliday({ ...selectedHoliday, startDate: e.target.value })}
            />
          </div>
          <div className="form-group py-2">
            <label>End Date</label>
            <input
              type="date"
              className="form-control"
              value={selectedHoliday?.endDate || ''} // Prefill with selected holiday's endDate
              onChange={(e) => setSelectedHoliday({ ...selectedHoliday, endDate: e.target.value })}
            />
          </div>
        </form>
      </>
    ),
  };

  const columns = [
    { Header: 'Holiday', accessor: 'name' },
    { Header: 'Start Date', accessor: 'startDate' },
    { Header: 'End Date', accessor: 'endDate' },
  ];

  const handleAddHolidayClick = () => {
    setOffcanvasType('new');
    setShowOffcanvas(true);
  };

  const handleFilterClick = () => {
    setShowFilterOffcanvas(true);
  };

  const handleEditHolidayClick = (holiday) => {
    setSelectedHoliday(holiday);  // Set selected holiday data
    setOffcanvasType('edit');
    setShowOffcanvas(true);
  };

  const handleDeleteHolidayClick = (holiday) => {
    Swal.fire({
      title: "Are you sure?",
      text: `You want to delete this Holiday?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!"
    }).then(async (result) => {
      if (result.isConfirmed) {
        const response = await apiCall(`master/deleteHoliday/${holiday.id}`, token, 'POST', null)
        if (response) {
          toast.success(response.message)
          const params = {page, per_page}
          dispatch(fetchHolidayData(token, params));
        }
      }
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
  const { holidayData } = useSelector(
    (state) => state.holiday
  );

  useEffect(() => {
    if (token) {
      const params = {
        per_page,
        page,
        fromDate: filters.fromDate,
        toDate: filters.toDate
      }
      dispatch(fetchHolidayData(token, params));
    }
  }, [token, per_page, page, dispatch, filters]);

  useEffect(() => {
    if (holidayData.pagination) {
      setPage(holidayData.pagination.page);
      setPer_page(holidayData.pagination.per_page);
      setTotal_page(holidayData.pagination.total_pages);
    }
  }, [holidayData.pagination]);

  useEffect(() => {
    localStorage.setItem('holidayFilter', JSON.stringify(filters));
  }, [filters]);

  return (
    <>
      <Layout>
        <section className="section">
          <div className="row mb-3">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', alignContent: 'center' }}>
              <h3>Holiday</h3>
              <div>
                {permissionData?.holiday?.canAddHoliday &&
                  <button
                    className="btn mx-1 mt-0"
                    onClick={handleAddHolidayClick}
                    style={{ color: '#338db5', border: '1px solid #338db5' }}
                  >
                    <i className="fa-solid fa-plus"></i>&nbsp;Holiday
                  </button>
                }
                <button
                  className="btn mx-1 mt-0"
                  onClick={handleFilterClick}
                  style={{ color: '#338db5', border: '1px solid #338db5',
                    backgroundColor: bgFilter ? '#dbf4ff' : 'transparent'
                   }}
                >
                  <i className="fa-solid fa-bars"></i>&nbsp;Filter
                </button>
              </div>
            </div>
          </div>

          <div className='row'>
            <div className="col-lg-12">
              <DataTable
                columns={columns}
                data={holidayData?.data}
                pagination={holidayData?.pagination}
                onClickPrevious={handlePreviousClick}
                onClickNext={handleNextClick}
                onPageSizeChange={handlePageSizeChange}
                editButton={permissionData?.holiday?.canUpdateHoliday}
                onEdit={(holiday) => handleEditHolidayClick(holiday)}
                deleteButton={permissionData?.holiday?.canDeleteHoliday}
                onDelete={(holiday) => handleDeleteHolidayClick(holiday)}
                footer={true}
              />
            </div>
          </div>

        </section>

        {/* Render OffCanvas dynamically */}
        {showOffcanvas && (
          <OffCanvas
            title={offcanvasType === 'new'
              ? 'Create Holiday'
              : offcanvasType === 'edit'
                ? 'Edit Holiday'
                : ''
            }
            content={offcanvasContent[offcanvasType]} // Dynamic content based on the offcanvas type
            onClose={handleCloseOffcanvas}
            handleCloseOffcanvas={handleCloseOffcanvas}
            handleSaveEdit={
              offcanvasType === 'new'
                ? handleAddHoliday
                : offcanvasType === 'edit'
                  ? handleSaveEdit
                  : ''
            }
          />
        )}

        {showFilterOffcanvas && (
          <FilterOffCanvas
            title={'Holiday'}
            content={offcanvasContent['filter']} // Dynamic content based on the offcanvas type
            onClose={handleCloseFilterOffcanvas}
            handleCloseOffcanvas={handleCloseFilterOffcanvas}
            handleClearAll={() => setFilters({
              fromDate: '',
              toDate: '',
            })}
          />
        )}
      </Layout>
    </>
  );
}

export default Holidays;