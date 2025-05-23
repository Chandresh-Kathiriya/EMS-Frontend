// src/Pages/WeekOff.js
import React, { useContext, useState, useEffect, useRef } from 'react';
import Swal from 'sweetalert2';
import { useSelector, useDispatch } from 'react-redux';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { toast } from 'react-toastify';
import { PermissionContext } from '../Context/PermissionContext';

// import require components
import DataTable from '../Components/DataTable';
import Layout from '../Components/Layout';
import OffCanvas from '../Components/OffCanvas';
import FilterOffCanvas from '../Components/FilterOffCanvas';
import { apiCall } from '../Components/API';

import { fetchWeekOffData } from '../redux/actions/weekOffActions';

function WeekOff() {
  const { permissionData } = useContext(PermissionContext);
  const token = localStorage.getItem('token');
  // if (!token) {
  //   window.location.href = '/login';
  // }

  const role = localStorage.getItem('role');
  const user = localStorage.getItem('id')

  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const [showFilterOffcanvas, setShowFilterOffcanvas] = useState(false);
  const [offcanvasType, setOffcanvasType] = useState('');
  const [offcanvasTitle, setOffcanvasTitle] = useState('')
  const [per_page, setPer_page] = useState(10)
  const [page, setPage] = useState(1)
  const [total_page, setTotal_page] = useState('')
  const [selectedDate, setSelectedDate] = useState(null);
  const [formData, setFormData] = useState({
    weekOffName: '',
    effectiveDate: null,
    days: {
      Monday: { isWeekOff: false, isHalfDay: false, selectedWeeks: [] },
      Tuesday: { isWeekOff: false, isHalfDay: false, selectedWeeks: [] },
      Wednesday: { isWeekOff: false, isHalfDay: false, selectedWeeks: [] },
      Thursday: { isWeekOff: false, isHalfDay: false, selectedWeeks: [] },
      Friday: { isWeekOff: false, isHalfDay: false, selectedWeeks: [] },
      Saturday: { isWeekOff: false, isHalfDay: false, selectedWeeks: [] },
      Sunday: { isWeekOff: false, isHalfDay: false, selectedWeeks: [] },
    }
  })

  const initialFilter = () => {
    try {
      const weekOff = localStorage.getItem('weekOffFilter');
      return weekOff ? JSON.parse(weekOff) : {};
    } catch (error) {
      console.error('Error parsing weekOffFilter:', error);
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

  const getFormattedDays = () => {
    const formattedDays = {};

    for (const [day, values] of Object.entries(formData.days)) {
      const dayInfo = [];

      if (values.isHalfDay) {
        dayInfo.push('Halfday');
      }

      if (values.isWeekOff) {
        dayInfo.push('WeekOff');
      }

      if (!values.isWeekOff && !values.isHalfDay && values.selectedWeeks?.length > 0) {
        dayInfo.push('WeekOff');
      }

      if (!values.isWeekOff && !values.isHalfDay) {
        dayInfo.push('FullDay');
      }

      if (values.selectedWeeks?.length > 0) {
        dayInfo.push(...values.selectedWeeks);
      }

      formattedDays[day] = dayInfo;
    }

    return Object.fromEntries(
      Object.entries(formData.days).map(([day, { isWeekOff, isHalfDay }]) => {
        const weekSelections = selectedWeeks[day] || [];

        let values = [];

        if (isWeekOff) {
          values.push('WeekOff');
        } else if (isHalfDay) {
          values.push('Halfday');
        } else if (weekSelections.length > 0) {
          values.push('WeekOff');
        } else {
          values.push('FullDay');
        }

        values = [...values, ...weekSelections];

        return [day, values];
      })
    );
  };

  const handleAddWeekOffClick = () => {
    setOffcanvasTitle('Create WeekOff')
    setFormData((prev) => ({
      ...prev,
      weekOffName: '',
      days: {
        Monday: { isWeekOff: false, isHalfDay: false, selectedWeeks: [] },
        Tuesday: { isWeekOff: false, isHalfDay: false, selectedWeeks: [] },
        Wednesday: { isWeekOff: false, isHalfDay: false, selectedWeeks: [] },
        Thursday: { isWeekOff: false, isHalfDay: false, selectedWeeks: [] },
        Friday: { isWeekOff: false, isHalfDay: false, selectedWeeks: [] },
        Saturday: { isWeekOff: false, isHalfDay: false, selectedWeeks: [] },
        Sunday: { isWeekOff: false, isHalfDay: false, selectedWeeks: [] },
      }
    }));
    setSelectedDate('')
    setShowOffcanvas(true);
    setOffcanvasType('new');
  };

  const handleFilterClick = () => {
    setShowFilterOffcanvas(true)
    setOffcanvasType('filter')
  }

  const handleCloseOffcanvas = () => {
    setShowOffcanvas(false);
  }

  const handleCloseFilterOffcanvas = () => {
    setShowFilterOffcanvas(false);
  }

  const handleEditWeekOff = (weekOff) => {
    setOffcanvasTitle('Edit WeekOff')
    const formattedData = Object.fromEntries(
      Object.entries(weekOff.days).map(([day, values]) => {
        return [
          day,
          {
            isWeekOff: values.includes('WeekOff'),
            isHalfDay: values.includes('Halfday'),
            weeks: values.filter(v => ['First', 'Second', 'Third', 'Fourth'].includes(v))
          }
        ];
      })
    );
    const selected = Object.fromEntries(
      Object.entries(formattedData).map(([day, obj]) => [day, obj.weeks])
    );

    setSelectedWeeks(selected);
    setFormData((prev) => ({
      ...prev,
      id: weekOff.id,
      weekOffName: weekOff.name,
      days: formattedData
    }));

    setSelectedDate(weekOff.effectiveDate)
    setOffcanvasType('new');
    setShowOffcanvas(true)
  }

  const handleDeleteWeekOff = (weekoff) => {
    Swal.fire({
      title: "Are you sure?",
      text: `You want to delete this WeekOff?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!"
    }).then(async (result) => {
      if (result.isConfirmed) {
        const data = {
          id: weekoff.id
        }
        const deleteWeekOff = await apiCall(`master/deleteWeekOff`, token, 'POST', data)
        toast.success(deleteWeekOff.message)
        dispatch(fetchWeekOffData(token, per_page, page));
      }
    })
  }

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      const formatted = getFormattedDays();

      const payload = {
        weekOffName: formData.weekOffName,
        effectiveDate: formData.effectiveDate,
        days: formatted,
        id: formData.id
      };

      const finalData = {
        ...payload,
        effectiveDate: selectedDate,
        user: user
      };

      // Basic validation
      if (!finalData.weekOffName || !finalData.effectiveDate) {
        toast.error('Both fields are required');
        return;
      }

      const response = await apiCall('master/addWeekOff', token, 'POST', finalData);
      toast.success(response.message)
      setShowOffcanvas(false)
      dispatch(fetchWeekOffData(token, per_page, page));
    } catch (error) {
      console.log(error)
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const formatted = getFormattedDays();

      const payload = {
        weekOffName: formData.weekOffName,
        effectiveDate: formData.effectiveDate,
        days: formatted,
        id: formData.id
      };

      const finalData = {
        ...payload,
        effectiveDate: selectedDate,
        user: user
      };

      // Basic validation
      if (!finalData.weekOffName || !finalData.effectiveDate) {
        toast.error('Both fields are required');
        return;
      }

      const response = await apiCall('master/editWeekOff', token, 'POST', finalData);
      if (response) {
        toast.success(response.message);
        setShowOffcanvas(false)
        dispatch(fetchWeekOffData(token, per_page, page));
      }

    } catch (error) {
      console.log(error)
    }
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === 'checkbox' || type === 'radio') {
      setFormData(prevData => ({
        ...prevData,
        [name]: type === 'checkbox' ? checked : value,
      }));
    } else {
      setFormData(prevData => ({
        ...prevData,
        [name]: value,
      }));
    }
  };

  // Handle week selection
  const handleWeekSelection = (day, week) => {
    const weeks = selectedWeeks[day] || [];

    const updatedWeeks = weeks.includes(week)
      ? weeks.filter(w => w !== week)
      : [...weeks, week];

    setSelectedWeeks(prev => ({
      ...prev,
      [day]: updatedWeeks,
    }));

    setFormData(prev => ({
      ...prev,
      days: {
        ...prev.days,
        [day]: {
          ...prev.days[day],
          selectedWeeks: updatedWeeks,
        },
      },
    }));
  };


  const handleRadioClick = (day, type) => {
    setFormData(prevFormData => {
      const current = prevFormData.days[day][type];
      const updated = {
        ...prevFormData,
        days: {
          ...prevFormData.days,
          [day]: {
            ...prevFormData.days[day],
            [type]: !current, // Toggle on click
            ...(type === 'isWeekOff' ? { isHalfDay: false } : {}),
            ...(type === 'isHalfDay' ? { isWeekOff: false } : {}),
          }
        }
      };
      return updated;
    });
  };

  const [openDropdown, setOpenDropdown] = useState(null);
  const [selectedWeeks, setSelectedWeeks] = useState({
    monday: [],
    tuesday: [],
    wednesday: [],
    thursday: [],
    friday: [],
    saturday: [],
    sunday: [],
  });

  const dropdownRef = useRef(null);

  const dispatch = useDispatch();
  const { weekOffData } = useSelector(
    (state) => state.weekOff
  );

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

  useEffect(() => {
    if (token) {
      const params ={ 
        per_page,
        page,
        fromDate: filters.fromDate,
        toDate: filters.toDate
      }
      dispatch(fetchWeekOffData(token, params));
    }
  }, [token, per_page, page, dispatch, filters]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (weekOffData.pagination) {
      setPage(weekOffData.pagination.page);
      setPer_page(weekOffData.pagination.per_page);
      setTotal_page(weekOffData.pagination.total_pages);
    }
  }, [weekOffData.pagination]);

  useEffect(() => {
    localStorage.setItem('weekOffFilter', JSON.stringify(filters));
  }, [filters]);


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
        <form >
          <div className="row">
            <div className="my-3" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', alignContent: 'center' }}>
              <div className="col-md-6">
                <div className="form-group" style={{ marginRight: '4px' }}>
                  <label>Name</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter WeekOff Name"
                    name="weekOffName"
                    value={formData.weekOffName}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-group">
                  <label>Effective Date</label>
                  <div className='form-control'>
                    <DatePicker
                      placeholderText='DD/MM/YYYY'
                      className='reactdatePicker'
                      selected={selectedDate}
                      onSelect={(e) => {
                        setSelectedDate(e)
                      }}
                      onChange={(e) => {
                        setSelectedDate(e)
                      }}
                      dateFormat="dd/MM/yyyy"
                      onChangeRaw={(e) => {
                        setSelectedDate(e.target.value)
                      }}
                      minDate={new Date()}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="row mt-3">
            <div className="col-md-12">
              <div className="form-group">
                <div className="datatable-container">
                  <div className="datatable-wrapper">
                    <table className="datatable weekOff-table">
                      <thead>
                        <tr className='custom-height-for-table'>
                          <th className="px-2">Days</th>
                          <th>Weekoff</th>
                          <th>Halfday</th>
                          <th>Week</th>
                        </tr>
                      </thead>
                      <tbody>
                        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                          <tr key={day} className='custom-height-for-table'>
                            <td className="px-2">{day}</td>
                            <td>
                              <input
                                type="radio"
                                id={`${day}.isWeekOff`}
                                name={day}
                                checked={formData.days[day].isWeekOff}
                                onClick={(e) => handleRadioClick(day, 'isWeekOff')}
                                onChange={() => { }}
                              />
                            </td>
                            <td>
                              <input
                                type="radio"
                                id={`${day}.isHalfDay`}
                                name={day}
                                checked={formData.days[day].isHalfDay}
                                onClick={(e) => handleRadioClick(day, 'isHalfDay')}
                                onChange={() => { }}
                              />
                            </td>
                            <td >
                              <div ref={dropdownRef} style={{ width: '26px' }}>
                                <button
                                  type="button"
                                  className="btn p-0 mt-0"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    setOpenDropdown(openDropdown === day ? null : day);
                                  }}
                                >
                                  <span>
                                    {selectedWeeks[day]?.length > 0 ? 'Selected' : 'Select'}
                                  </span>
                                </button>

                                {openDropdown === day && (
                                  <div className="dropdown-menu show position-absolute bg-white border rounded "
                                    onMouseDown={(e) => e.stopPropagation()}>
                                    {['First', 'Second', 'Third', 'Fourth'].map(week => (
                                      <div key={week} className="pointer form-check px-2" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                                        onClick={() => handleWeekSelection(day, week)}>
                                        <label className="pointer form-check-label" >
                                          {week}
                                        </label>
                                        <input
                                          id={`checkbox-${day}-${week}`}
                                          className="pointer form-check-input"
                                          type="checkbox"
                                          style={{ marginLeft: '1rem' }}
                                          checked={(selectedWeeks[day] || []).includes(week)}
                                        />
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </>
    ),
  };

  const columns = [
    { Header: 'WeekOff Name', accessor: 'name' },
    { Header: 'Effective Date', accessor: 'effectiveDate' },
  ];

  const expandColumns = [
    { Header: 'Sunday', accessor: 'Sunday' },
    { Header: 'Monday', accessor: 'Monday' },
    { Header: 'Tuesday', accessor: 'Tuesday' },
    { Header: 'Wednesday', accessor: 'Wednesday' },
    { Header: 'Thursday', accessor: 'Thursday' },
    { Header: 'Friday', accessor: 'Friday' },
    { Header: 'Saturday', accessor: 'Saturday' }
  ]

  const expandedRowContent = (rowData) => {

    const formattedWeekData = Object.fromEntries(
      Object.entries(rowData.days).map(
        ([day, values]) => [day, values.join(', ')]
      )
    );

    const expandData = [formattedWeekData]

    return (
      <>
        <div className='mx-5 py-3'>
          <DataTable
            columns={expandColumns}
            data={expandData}
            footer={false}
            index={false}
          />
        </div>
      </>
    )
  }

  return (
    <>
      <Layout>
        <section className="section">

          <div className="row mb-3">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', alignContent: 'center' }}>
              <h3>Week Off</h3>
              <div>
                {permissionData?.weekOff?.canAddWeekoff &&
                  <button
                    className="btn mx-1 mt-0"
                    onClick={handleAddWeekOffClick}
                    style={{ color: '#338db5', border: '1px solid #338db5' }}
                  >
                    <i className="fa-solid fa-plus"></i>&nbsp;WeekOff
                  </button>
                }
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
              </div>
            </div>
          </div>

          <div className='row'>
            <div className="col-lg-12">

              <DataTable
                columns={columns}
                data={weekOffData.data}
                pagination={weekOffData.pagination}
                onClickPrevious={handlePreviousClick}
                onClickNext={handleNextClick}
                onPageSizeChange={handlePageSizeChange}
                footer={true}
                editButton={permissionData?.weekOff?.canUpdateWeekoff}
                onEdit={handleEditWeekOff}
                deleteButton={permissionData?.weekOff?.canDeleteWeekoff}
                onDelete={handleDeleteWeekOff}
                expandedRowContent={(row) => expandedRowContent(row)}
              />
            </div>
          </div>

        </section>
      </Layout>

      {showOffcanvas && (
        <OffCanvas
          title={offcanvasTitle}
          content={offcanvasContent[offcanvasType]}
          onClose={handleCloseOffcanvas}
          handleCloseOffcanvas={handleCloseOffcanvas}
          handleSaveEdit={
            offcanvasTitle === 'Create WeekOff'
              ? handleCreateSubmit
              : offcanvasTitle === 'Edit WeekOff'
                ? handleEditSubmit
                : ''
          }
        />
      )}

      {showFilterOffcanvas && (
        <FilterOffCanvas
          title={'WeekOff'}
          content={offcanvasContent[offcanvasType]}
          onClose={handleCloseFilterOffcanvas}
          handleCloseOffcanvas={handleCloseFilterOffcanvas}
          handleClearAll={() => setFilters({
            fromDate: '',
            toDate: '',
          })}
        />
      )}
    </>
  );
}

export default WeekOff;