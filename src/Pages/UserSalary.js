// src/Pages/UserSalary.js

// import core module
import React, { useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';

// import require component
import Layout from '../Components/Layout';
import { PermissionContext } from '../Context/PermissionContext';
import DataTable from '../Components/DataTable';
import OffCanvas from '../Components/OffCanvas';
import FilterOffCanvas from '../Components/FilterOffCanvas';
import SelectInput from '../Components/SelectInput';
import DatePicker from 'react-datepicker';

import { fetchUserSalaryData, fetchUserData, createUserSalary, editUserSalary, deleteUserSalary } from '../redux/actions/userSalaryAction';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';

const UserSalary = () => {
  const token = localStorage.getItem('token')
  const user = localStorage.getItem('id')
  const { permissionData } = useContext(PermissionContext);
  const [showOffcanvas, setShowOffcanvas] = useState(false)
  const [offcanvasTitle, setOffcanvasTitle] = useState(false)
  const [showFilterOffcanvas, setShowFilterOffcanvas] = useState(false)
  const [per_page, setPer_page] = useState(10)
  const [page, setPage] = useState(1)
  const [total_page, setTotal_page] = useState('')
  const [salaryForm, setSalaryForm] = useState({
    id: null,
    user: null,
    effectiveDate: null,
    salary: null,
    isActive: false,
  })
  const [formErrors, setFormErrors] = useState({})

  const initialFilter = () => {
    try {
      const filter = localStorage.getItem('userSalaryFilter');
      return filter ? JSON.parse(filter) : {};
    } catch (error) {
      console.error('Error parsing userSalaryFilter:', error);
      return {};
    }
  };

  const filter = initialFilter();
  const bgFilter = Object.values(filter).some(value => value != null && value !== '');

  const [filters, setFilters] = useState(() => {
    const init = initialFilter();
    return {
      user: init.user || '',
      minSalary: init.minSalary || '',
      maxSalary: init.maxSalary || '',
      fromDate: init.fromDate || null,
      toDate: init.toDate || null,
      isActive: init.isActive || undefined,
    }
  })

  const dispatch = useDispatch();
  const { userSalaryData, userData } = useSelector(
    (state) => state.userSalary
  );

  const handleCreateSalary = () => {
    setOffcanvasTitle('Create Salary')
    setSalaryForm({})
    setShowOffcanvas(true)
  }

  const handleFilter = () => {
    setOffcanvasTitle('Salary')
    setSalaryForm({})
    setShowFilterOffcanvas(true)
  }

  const handleEditSalary = (UserSalary) => {
    setOffcanvasTitle('Edit Salary')
    setSalaryForm({
      id: UserSalary.id,
      user: UserSalary.userId,
      effectiveDate: UserSalary.effectiveDate,
      salary: UserSalary.amount,
      isActive: UserSalary.isActive === 'Yes',
    })
    setShowOffcanvas(true)
  }

  const handleDeleteSalary = (UserSalary) => {
    Swal.fire({
      title: "Are you sure?",
      text: `You want to delete this ${UserSalary.user}'s salary?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!"
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const payload = {
            id: UserSalary.id,
            page,
            per_page
          }
          dispatch(deleteUserSalary(token, payload));
          setShowOffcanvas(false)
        } catch (error) {
          console.error("Delete error:", error);
          toast.error("Something went wrong while deleting salary.");
        }
      }
    });
  }

  const handleCloseOffcanvas = () => {
    setFormErrors({})
    setShowOffcanvas(false)
  }

  const handleFilterCloseOffcanvas = () => {
    setShowFilterOffcanvas(false)
  }

  const handleClearAll = () => {
    setFormErrors({})
    setFilters({
      user: '',
      minSalary: '',
      maxSalary: '',
      fromDate: null,
      toDate: null,
      isActive: undefined,
    });
  }

  const handleSaveCreateSalary = async () => {
    const errors = {};

    if (!salaryForm.user) {
      errors.user = 'User Required';
    }

    if (!salaryForm.salary) {
      errors.salary = 'Salary Required';
    } else if (Number(salaryForm.salary) <= 0) {
      errors.salary = 'Salary must be greater than 0';
    }

    if (!salaryForm.effectiveDate) {
      errors.effectiveDate = 'Effective Date Required';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    } else {
      const payload = {
        ...salaryForm,
        parentUser: user,
        page,
        per_page
      }
      dispatch(createUserSalary(token, payload));
      setShowOffcanvas(false)
    }
  }

  const handleSaveEditSalary = async () => {
    const errors = {};

    if (!salaryForm.user) {
      errors.user = 'User Required';
    }

    if (!salaryForm.salary) {
      errors.salary = 'Salary Required';
    } else if (Number(salaryForm.salary) <= 0) {
      errors.salary = 'Salary must be greater than 0';
    }

    if (!salaryForm.effectiveDate) {
      errors.effectiveDate = 'Effective Date Required';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    } else {
      const payload = {
        ...salaryForm,
        parentUser: user,
        page,
        per_page
      }

      dispatch(editUserSalary(token, payload));
      setShowOffcanvas(false)
    }
  }

  const handleFieldChange = (field, valueOrEvent) => {
    if (valueOrEvent && valueOrEvent.target) {
      const { name, value, type, checked } = valueOrEvent.target;
      const newValue = type === 'number' ? (value ? Number(value) : '') : value;
      setSalaryForm((prevForm) => ({
        ...prevForm,
        [name]: type === 'checkbox' ? checked : newValue,
      }));
    } else {
      setSalaryForm((prevForm) => ({
        ...prevForm,
        [field]: valueOrEvent,
      }));
    }
  };

  const userOption = userData?.data?.map(user => ({
    value: user.id,
    label: user.full_name
  }));

  const selectedUser = userOption?.find(
    (option) => option.value === salaryForm.user
  ) || null;

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
    setPage(1);
  };

  useEffect(() => {
    if (token) {
      dispatch(fetchUserData(token));
    }
  }, [token]);

  const debounceTimeout = useRef(null);

  useEffect(() => {
    if (Object.keys(formErrors).length > 0) {
      return;
    }

    const params = {
      ...filters,
      page: page || 1,
      per_page: per_page || 10,
    };

    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    debounceTimeout.current = setTimeout(() => {
      if (token) {
        dispatch(fetchUserSalaryData(token, params));
      }
    }, 500);

  }, [token, page, per_page, filters]);


  useEffect(() => {
    if (userSalaryData.pagination) {
      setPage(userSalaryData.pagination.page);
      setPer_page(userSalaryData.pagination.per_page);
      setTotal_page(userSalaryData.pagination.total_pages);
    }
  }, [userSalaryData.pagination]);

  useEffect(() => {
    localStorage.setItem('userSalaryFilter', JSON.stringify(filters));
  }, [filters]);

  const columns = [
    { Header: 'User', accessor: 'user' },
    { Header: 'Salary', accessor: 'amount' },
    { Header: 'Effective Date', accessor: 'effectiveDate' },
    { Header: 'Active', accessor: 'isActive' },
  ]

  const handleFilterChange = useCallback((value, filterName, type = 'text') => {
    let finalValue;

    if (type === 'date') {
      finalValue = value ? value.toISOString() : null;
    } else if (type === 'checkbox') {
      finalValue = !!value;
    } else {
      finalValue = value?.target?.value || value?.value || '';
    }

    setFilters((prevFilters) => {
      const updatedFilters = {
        ...prevFilters,
        [filterName]: finalValue,
      };

      const min = Number(updatedFilters.minSalary);
      const max = Number(updatedFilters.maxSalary);

      const errors = {};

      // Check if both are greater than 0
      if (updatedFilters.minSalary && min <= 0) {
        errors.minSalary = 'Minimum salary must be greater than 0.';
      }

      if (updatedFilters.maxSalary && max <= 0) {
        errors.maxSalary = 'Maximum salary must be greater than 0.';
      }

      // Check that max > min if both are present and valid
      if (
        updatedFilters.minSalary &&
        updatedFilters.maxSalary &&
        min > 0 &&
        max > 0 &&
        max < min
      ) {
        errors.maxSalary = 'Max salary must be greater than min salary.';
      }

      setFormErrors(errors);
      return updatedFilters;
    });
  }, []);

  const offcanvasContent = {
    salary: (
      <>
        <form>
          <div className="form-group col-md-12">
            <label>User</label>
            <div className={`form-control m-0 p-0 ${formErrors?.user ? 'is-invalid' : ''}`} >
              <SelectInput
                placeholder={'Select User'}
                value={selectedUser}
                options={userOption}
                onChange={(selectedOption) => handleFieldChange('user', selectedOption?.value || null)}
                onSelect={(selectedOption) => handleFieldChange('user', selectedOption?.value || null)}
              />
            </div>
            {formErrors?.user && (
              <div className="invalid-feedback">
                {formErrors.user}
              </div>
            )}
          </div>
          <div className="col-md-12">
            <label htmlFor="effectiveDate" className="text-dark form-label mb-0 mt-2">Effective Date</label>
            <div
              className={`form-control ${formErrors?.effectiveDate ? 'is-invalid' : ''}`}
            >
              <DatePicker
                id='effectiveDate'
                className='reactdatePicker'
                placeholderText='MM/YYYY'
                selected={salaryForm?.effectiveDate || null}
                onSelect={(e) => {
                  setSalaryForm({ ...salaryForm, effectiveDate: e })
                }}
                onChange={(e) => handleFieldChange('effectiveDate', e)}
                dateFormat="MM/yyyy"
                showMonthYearPicker
                clearButtonTitle='Delete'
                isClearable={true}
                clearButtonClassName='m-0 p-0 mx-5'
                onChangeRaw={() => {
                  setSalaryForm({ ...salaryForm, effectiveDate: null })
                }}
              />
            </div>
            {formErrors?.effectiveDate && (
              <div className="invalid-feedback">
                {formErrors.effectiveDate}
              </div>
            )}
          </div>
          <div className="col-md-12">
            <label htmlFor="salary" className="text-dark form-label mb-0 mt-2">Salary</label>
            <input
              id='salary'
              type="number"
              name="salary"
              className={`form-control ${formErrors?.salary ? 'is-invalid' : ''}`}
              placeholder={'Enter salary'}
              value={salaryForm?.salary || ''}
              onChange={(e) => handleFieldChange('salary', e)}
            />
            {formErrors?.salary && (
              <div className="invalid-feedback">
                {formErrors.salary}
              </div>
            )}
          </div>
          <div className="d-flex justify-content-between align-items-center my-2">
            <label htmlFor="isActive" className="form-label mb-0 mt-2 text-dark">Is Active</label>
            <div className="form-check form-switch mt-3">
              <input
                id='isActive'
                name="isActive"
                className="form-check-input checkbox-large"
                type="checkbox"
                checked={salaryForm?.isActive}
                onChange={(e) => handleFieldChange('isActive', e)}
              />
            </div>
          </div>
        </form>
      </>
    ),
    filter: (
      <>
        <form>
          <div className="form-group pb-2">
            <label htmlFor='user'>User</label>
            <input
              id='user'
              type='text'
              name='user'
              className='form-control'
              placeholder='Enter User'
              value={filters.user || ''}
              onChange={(e) => handleFilterChange(e, 'user')}
            />
          </div>
          <div className="form-group pb-2">
            <label htmlFor='minSalary'>Min. Salary</label>
            <input
              id='minSalary'
              type='number'
              name='minSalary'
              className={`form-control ${formErrors?.minSalary ? 'is-invalid' : ''}`}
              placeholder='Enter Minimun Salary'
              value={filters.minSalary || ''}
              onChange={(e) => handleFilterChange(e, 'minSalary')}
            />
            {formErrors?.minSalary && (
              <div className="invalid-feedback">
                {formErrors.minSalary}
              </div>
            )}
          </div>
          <div className="form-group pb-2">
            <label htmlFor='maxSalary'>Max. Salary</label>
            <input
              id='maxSalary'
              type='number'
              name='maxSalary'
              className={`form-control ${formErrors?.maxSalary ? 'is-invalid' : ''}`}
              placeholder='Enter Maximum Salary'
              value={filters.maxSalary || ''}
              onChange={(e) => handleFilterChange(e, 'maxSalary')}
            />
            {formErrors?.maxSalary && (
              <div className="invalid-feedback">
                {formErrors.maxSalary}
              </div>
            )}
          </div>
          <div className='col-md-12'>
            <label>From</label>
            <div className='form-control'>
              <DatePicker
                className='reactdatePicker'
                selected={filters.fromDate ? new Date(filters.fromDate) : null}
                onChange={(date) => handleFilterChange(date, 'fromDate', 'date')}
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
                onChange={(date) => handleFilterChange(date, 'toDate', 'date')}
                dateFormat="dd/MM/yyyy"
                placeholderText="DD/MM/YYYY"
                isClearable
                clearButtonClassName='m-0 p-0 mx-5'
              />
            </div>
          </div>
          <div className="d-flex justify-content-between align-items-center my-2">
            <label htmlFor="isActive" className="form-label mb-0 mt-2 text-dark">Is Active</label>
            <div className="form-check form-switch mt-3">
              <input
                id='isActive'
                name="isActive"
                className="form-check-input checkbox-large"
                type="checkbox"
                checked={!!filters.isActive}
                onChange={(e) => handleFilterChange(e.target.checked, 'isActive', 'checkbox')}
              />
            </div>
          </div>
        </form>
      </>
    )
  }

  return (
    <Layout>
      <section className="section dashboard">
        <div className="row">
          <div className="col-lg-12">
            <div className="pagetitle d-flex justify-content-between align-items-center flex-wrap align-content-center">
              <h1>User Salary</h1>
              <div>
                <button
                  type="button"
                  className="btn mx-1 mt-0"
                  onClick={handleFilter}
                  style={{
                    color: '#338db5', border: '1px solid #338db5',
                    backgroundColor: bgFilter ? '#dbf4ff' : 'transparent'
                  }}
                >
                  <i className="fa-solid fa-bars"></i>&nbsp;Filters
                </button>
                {permissionData?.userSalary?.canAddUserSalary &&
                  <button
                    type="button"
                    className="btn mx-1 mt-0"
                    onClick={handleCreateSalary}
                    style={{ color: '#338db5', border: '1px solid #338db5' }}
                  >
                    <i className="fa-solid fa-coins"></i>&nbsp;Salary
                  </button>
                }
              </div>
            </div>

            <div className="row">
              <div className="col-lg-12">
                <DataTable
                  columns={columns}
                  data={userSalaryData?.data}
                  pagination={userSalaryData.pagination}
                  onClickPrevious={handlePreviousClick}
                  onClickNext={handleNextClick}
                  onPageSizeChange={handlePageSizeChange}
                  footer={true}
                  editButton={permissionData?.userSalary?.canUpdateUserSalary}
                  deleteButton={permissionData?.userSalary?.canDeleteUserSalary}
                  onEdit={(salary) => handleEditSalary(salary)}
                  onDelete={(salary) => handleDeleteSalary(salary)}
                />
              </div>
            </div>
          </div>
        </div>
      </section>
      {showOffcanvas && (
        <OffCanvas
          title={offcanvasTitle}
          content={offcanvasContent['salary']}
          onClose={handleCloseOffcanvas}
          handleCloseOffcanvas={handleCloseOffcanvas}
          handleSaveEdit={offcanvasTitle === 'Create Salary' ? handleSaveCreateSalary : offcanvasTitle === 'Edit Salary' ? handleSaveEditSalary : ''}
        />
      )}
      {showFilterOffcanvas && (
        <FilterOffCanvas
          title={'User Salary'}
          content={offcanvasContent['filter']}
          onClose={handleFilterCloseOffcanvas}
          handleCloseOffcanvas={handleFilterCloseOffcanvas}
          handleClearAll={handleClearAll}
        />
      )}
    </Layout>
  );
};

export default UserSalary;