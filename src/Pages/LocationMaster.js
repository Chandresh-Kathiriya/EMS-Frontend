// src/Pages/Settings.js

// import core module
import React, { useState, useContext, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Swal from 'sweetalert2';

// import require component
import Layout from '../Components/Layout';
import OffCanvas from '../Components/OffCanvas';
import { PermissionContext } from '../Context/PermissionContext';
import { toast } from 'react-toastify';
import DataTable from '../Components/DataTable';

import { fetchLocationMasterData, editLocationMasterData, createLocationMasterData, deleteLocationMaster } from '../redux/actions/locationMasterAction';

const LocationMaster = () => {
  const { permissionData } = useContext(PermissionContext);
  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const [offcanvasType, setOffcanvasType] = useState(null);
  const [offcanvasTitle, setOffcanvasTitle] = useState('')
  const [per_page, setPer_page] = useState(10)
  const [page, setPage] = useState(1)
  const [total_page, setTotal_page] = useState('')
  const [locationMasterForm, setLocationMasterForm] = useState({
    id: null,
    name: '',
    isRangeRequired: false,
    rangeArea: '',
    latitude: '',
    longitude: '',
  })
  const [formErrors, setFormErrors] = useState({
    name: '',
    rangeArea: '',
    latitude: '',
    longitude: '',
  })

  const token = localStorage.getItem('token')
  if (!token) window.location.href = '/login'

  const columns = [
    { Header: 'Name', accessor: 'name' },
    { Header: 'Is Range Required', accessor: 'isRangeRequired' },
    { Header: 'Range Area', accessor: 'rangeArea' },
    { Header: 'Location', accessor: 'location' },
  ];

  const handleEditLocationMaster = (locationMaster) => {
    setLocationMasterForm({
      id: locationMaster.id,
      name: locationMaster.name,
      latitude: locationMaster.latitude,
      longitude: locationMaster.longitude,
      isRangeRequired: ['Yes', true, 1].includes(locationMaster.isRangeRequired),
      rangeArea: locationMaster.rangeArea
    })
    setOffcanvasTitle('Edit Location Master')
    setOffcanvasType('locationMaster')
    setShowOffcanvas(true)
  }

  const handleDeleteLocationMaster = (locationMaster) => {
    Swal.fire({
      title: "Are you sure?",
      text: `You want to delete this Location Master?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!"
    }).then(async (result) => {
      if (result.isConfirmed) {
        const params = {
          id: locationMaster.id,
          per_page,
          page
        }
        dispatch(deleteLocationMaster(token, params));
      }
    });
  }

  const handleCreateLocationMaster = () => {
    setOffcanvasTitle('Create Location Master')
    setOffcanvasType('locationMaster')
    setShowOffcanvas(true)
  }

  const handleCloseOffcanvas = () => {
    setFormErrors({})
    setLocationMasterForm({})
    setShowOffcanvas(false)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLocationMasterForm((prevForm) => ({
      ...prevForm,
      [name]: value,
    }));
  };

  const handleCreateSave = async () => {
    const errors = {};
    if (!locationMasterForm.name) {
      errors.name = 'Name Required';
    }
    if (!locationMasterForm.latitude) {
      errors.latitude = 'Latitude Required';
    }
    if (!locationMasterForm.longitude) {
      errors.longitude = 'Longitude Required';
    }
    if (locationMasterForm.isRangeRequired) {
      if (!locationMasterForm.rangeArea) {
        errors.rangeArea = 'Range Area Required'
      }
    }
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    } else {
      // API Call
      const params = { per_page, page };
      dispatch(createLocationMasterData(token, locationMasterForm, params));
      setFormErrors({});
      setShowOffcanvas(false)
    }
  }

  const handleEditSave = async () => {
    const errors = {};
    if (!locationMasterForm.name) {
      errors.name = 'Name Required';
    }
    if (!locationMasterForm.latitude) {
      errors.latitude = 'Latitude Required';
    }
    if (!locationMasterForm.longitude) {
      errors.longitude = 'Longitude Required';
    }
    if (locationMasterForm.isRangeRequired) {
      if (!locationMasterForm.rangeArea) {
        errors.rangeArea = 'Range Area Required'
      }
    }
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    } else {
      // API Call
      const params = { per_page, page };
      dispatch(editLocationMasterData(token, locationMasterForm, params));
      setFormErrors({});
      setShowOffcanvas(false)
    }
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
    setPage(1);
  };

  const dispatch = useDispatch();
  const { locationMasterData } = useSelector(
    (state) => state.locationMaster
  );

  useEffect(() => {
    if (token) {
      const params = {
        per_page,
        page,
      };
      dispatch(fetchLocationMasterData(token, params));
    }
  }, [token, per_page, page, dispatch]);

  useEffect(() => {
    if (locationMasterData.pagination) {
      setPage(locationMasterData.pagination.page);
      setPer_page(locationMasterData.pagination.per_page);
      setTotal_page(locationMasterData.pagination.total_pages);
    }
  }, [locationMasterData.pagination]);

  const offcanvasContent = {
    locationMaster: (
      <>
        <form>
          <div className="col-md-12">
            <label htmlFor="name" className="form-label mb-0 mt-2 text-dark">Name</label>
            <input
              id="name"
              type="text"
              name="name"
              className={`form-control ${formErrors?.name ? 'is-invalid' : ''}`}
              placeholder="Enter Name"
              value={locationMasterForm?.name || ''}
              onChange={handleInputChange}
            />
            {formErrors?.name && (
              <div className="invalid-feedback">
                {formErrors.name}
              </div>
            )}
          </div>
          <div className="col-md-12">
            <label htmlFor="latitude" className="form-label mb-0 mt-2 text-dark">Latitude</label>
            <input
              id="latitude"
              type="text"
              name="latitude"
              className={`form-control ${formErrors?.latitude ? 'is-invalid' : ''}`}
              placeholder="Enter Latitude"
              value={locationMasterForm?.latitude || ''}
              onChange={handleInputChange}
            />
            {formErrors?.latitude && (
              <div className="invalid-feedback">
                {formErrors.latitude}
              </div>
            )}
          </div>
          <div className="col-md-12">
            <label htmlFor="longitude" className="form-label mb-0 mt-2 text-dark">Longitude</label>
            <input
              id="longitude"
              type="text"
              name="longitude"
              className={`form-control ${formErrors?.longitude ? 'is-invalid' : ''}`}
              placeholder="Enter Longitude"
              value={locationMasterForm?.longitude || ''}
              onChange={handleInputChange}
            />
            {formErrors?.longitude && (
              <div className="invalid-feedback">
                {formErrors.longitude}
              </div>
            )}
          </div>
          <div className="d-flex justify-content-between align-items-center my-2">
            <label htmlFor="isRangeRequired" className="form-label mb-0 mt-2 text-dark">Is Range Required</label>
            <div className="form-check form-switch mt-3">
              <input
                id='isRangeRequired'
                className="form-check-input checkbox-large"
                type="checkbox"
                checked={locationMasterForm?.isRangeRequired}
                onChange={(e) =>
                  setLocationMasterForm({
                    ...locationMasterForm,
                    isRangeRequired: e.target.checked,
                  })
                }
              />
            </div>
          </div>
          {locationMasterForm?.isRangeRequired &&
            <div className="col-md-12">
              <label htmlFor="rangeArea" className="form-label mb-0 mt-2 text-dark">
                Range Area <small className="text-muted">(In meters)</small>
              </label>
              <input
                id="rangeArea"
                type="number"
                name="rangeArea"
                className={`form-control ${formErrors?.rangeArea ? 'is-invalid' : ''}`}
                placeholder="Enter Range Area"
                value={locationMasterForm?.rangeArea || ''}
                onChange={handleInputChange}
              />
              {formErrors?.rangeArea && (
                <div className="invalid-feedback">
                  {formErrors.rangeArea}
                </div>
              )}
            </div>
          }
        </form>
      </>
    )
  }

  return (
    <Layout>
      <section className="section dashboard">
        <div className="row mb-3">
          <div className="col-lg-12">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', alignContent: 'center' }}>
              <h3>Location Master</h3>
              {permissionData?.locationMaster?.canAddLocationMaster &&
                <button
                  type="button"
                  className="btn mx-1 mt-0"
                  onClick={handleCreateLocationMaster}
                  style={{ color: '#338db5', border: '1px solid #338db5' }}
                >
                  <i className="fa-solid fa-circle-plus"></i>&nbsp;Location Master
                </button>
              }
            </div>
          </div>
        </div>
        <div className='row'>
          <div className="col-lg-12">
            <DataTable
              columns={columns}
              data={locationMasterData?.data}
              editButton={permissionData?.locationMaster?.canUpdateLocationMaster}
              deleteButton={permissionData?.locationMaster?.canDeleteLocationMaster}
              footer={true}
              onEdit={handleEditLocationMaster}
              onDelete={handleDeleteLocationMaster}
              pagination={locationMasterData.pagination}
              onClickPrevious={handlePreviousClick}
              onClickNext={handleNextClick}
              onPageSizeChange={handlePageSizeChange}
            />
          </div>
        </div>
      </section>

      {/* Offcanvas Component for new and edit project */}
      {showOffcanvas && (
        <OffCanvas
          title={offcanvasTitle}
          content={offcanvasContent[offcanvasType]}
          onClose={handleCloseOffcanvas}
          handleCloseOffcanvas={handleCloseOffcanvas}
          handleSaveEdit={offcanvasTitle === 'Create Location Master' ? handleCreateSave : offcanvasTitle === 'Edit Location Master' ? handleEditSave : ''}
        />
      )}
    </Layout>
  );
};

export default LocationMaster;