// src/Pages/Settings.js

// import core module
import React, { useState, useContext, useEffect } from 'react';

// import require component
import Layout from '../Components/Layout';
import OffCanvas from '../Components/OffCanvas';
import { apiCall } from '../Components/API';
import { toast } from 'react-toastify';
import { PermissionContext } from '../Context/PermissionContext';

const Settting = () => {
  const { permissionData, punchData, smtpData } = useContext(PermissionContext);
  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const [offcanvasType, setOffcanvasType] = useState(null);
  const [offcanvasTitle, setOffcanvasTitle] = useState('')
  const [attendanceForm, setAttendanceForm] = useState({
    image: ''
  })
  const [SMTPForm, setSMTPForm] = useState({
    host: '',
    port: '',
    userEmail: '',
    password: '',
    fromName: '',
    emailFrom: '',
    bbcEmail: ''
  })
  const [formErrors, setFormErrors] = useState({
    host: '',
    port: '',
    userEmail: '',
    password: '',
    fromName: '',
    emailFrom: '',
    bbcEmail: ''
  })

  const token = localStorage.getItem('token')
  // if (!token) window.location.href = '/login'

  const handleSMTPClick = () => {
    setOffcanvasType('SMTP')
    setOffcanvasTitle('SMTP Settings')
    setShowOffcanvas(true)
  }

  const handleAttendanceClick = () => {
    setOffcanvasType('Attendance')
    setOffcanvasTitle('Attendance Settings')
    setShowOffcanvas(true)
  }

  const handleCloseOffcanvas = () => {
    setFormErrors({});
    setShowOffcanvas(false)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSMTPForm((prevForm) => ({
      ...prevForm,
      [name]: value,
    }));
  };

  const handleSaveSMTP = async () => {
    const errors = {};

    if (!SMTPForm.userEmail?.trim()) {
      errors.userEmail = 'User Email Required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(SMTPForm.userEmail)) {
      errors.userEmail = 'Invalid Email Format';
    }

    if (!SMTPForm.emailFrom?.trim()) {
      errors.emailFrom = 'From Email Required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(SMTPForm.emailFrom)) {
      errors.emailFrom = 'Invalid Email Format';
    }

    if (!SMTPForm.bbcEmail?.trim()) {
      errors.bbcEmail = 'BBC Email Required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(SMTPForm.bbcEmail)) {
      errors.bbcEmail = 'Invalid Email Format';
    }

    if (!SMTPForm.host) {
      errors.host = 'SMTP Host Required';
    }

    if (!SMTPForm.port) {
      errors.port = 'SMTP Port Required';
    }

    if (!SMTPForm.password) {
      errors.password = 'Password Required';
    }

    if (!SMTPForm.fromName) {
      errors.fromName = 'From Name Required';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors); // No need to spread prev
      return;
    } else {
      try {
        // API CALL 
        const smtpUpdate = await apiCall('setting/smtp', token, 'POST', SMTPForm)
        if (smtpUpdate?.message == 'SMTP settings updated successfully!' || smtpUpdate?.status === 'SMTP settings created successfully!') {
          toast.success(smtpUpdate?.message)
        }
        setFormErrors({});
        setShowOffcanvas(false)
      } catch (error) {
        console.log(error)
      }
    }
  }

  const handleSaveAttendance = async () => {
    try {
      // API CALL
      const attendanceUpdate = await apiCall('setting/attendance', token, 'POST', attendanceForm)
      if (attendanceUpdate?.message == 'Attendance settings updated successfully!' || attendanceUpdate?.status === 'Attendance settings created successfully!') {
        toast.success(attendanceUpdate?.message)
      }
      setShowOffcanvas(false)
    } catch (error) {
      console.log(error)
    }
  }

  const offcanvasContent = {
    SMTP: (
      <>
        <form>
          <div className="col-md-12">
            <label htmlFor="host" className="form-label mb-0 mt-2 text-dark">SMTP Host</label>
            <input
              id="host"
              type="text"
              name="host"
              className={`form-control ${formErrors?.host ? 'is-invalid' : ''}`}
              placeholder="Enter SMTP Host"
              value={SMTPForm?.host || ''}
              onChange={handleInputChange}
            />
            {formErrors?.host && (
              <div className="invalid-feedback">
                {formErrors.host}
              </div>
            )}
          </div>
          <div className="col-md-12">
            <label htmlFor="port" className="form-label mb-0 mt-2 text-dark">SMTP Port</label>
            <input
              id="port"
              type="number"
              name="port"
              className={`form-control ${formErrors?.port ? 'is-invalid' : ''}`}
              placeholder="Enter SMTP Port"
              value={SMTPForm?.port || ''}
              onChange={handleInputChange}
            />
            {formErrors?.port && (
              <div className="invalid-feedback">
                {formErrors.port}
              </div>
            )}
          </div>
          <div className="col-md-12">
            <label htmlFor="userEmail" className="form-label mb-0 mt-2 text-dark">User Email</label>
            <input
              id="userEmail"
              type="text"
              name="userEmail"
              className={`form-control ${formErrors?.userEmail ? 'is-invalid' : ''}`}
              placeholder="Enter User Email"
              value={SMTPForm?.userEmail || ''}
              onChange={handleInputChange}
            />
            {formErrors?.userEmail && (
              <div className="invalid-feedback">
                {formErrors.userEmail}
              </div>
            )}
          </div>
          <div className="col-md-12">
            <label htmlFor="password" className="form-label mb-0 mt-2 text-dark">Password</label>
            <input
              id="password"
              type="text"
              name="password"
              className={`form-control ${formErrors?.password ? 'is-invalid' : ''}`}
              placeholder="Enter Password"
              value={SMTPForm?.password || ''}
              onChange={handleInputChange}
            />
            {formErrors?.password && (
              <div className="invalid-feedback">
                {formErrors.password}
              </div>
            )}
          </div>
          <div className="col-md-12">
            <label htmlFor="fromName" className="form-label mb-0 mt-2 text-dark">From Name</label>
            <input
              id="fromName"
              type="text"
              name="fromName"
              className={`form-control ${formErrors?.fromName ? 'is-invalid' : ''}`}
              placeholder="Enter From Name"
              value={SMTPForm?.fromName || ''}
              onChange={handleInputChange}
            />
            {formErrors?.fromName && (
              <div className="invalid-feedback">
                {formErrors.fromName}
              </div>
            )}
          </div>
          <div className="col-md-12">
            <label htmlFor="emailFrom" className="form-label mb-0 mt-2 text-dark">Email From</label>
            <input
              id="emailFrom"
              type="text"
              name="emailFrom"
              className={`form-control ${formErrors?.emailFrom ? 'is-invalid' : ''}`}
              placeholder="Enter Email From"
              value={SMTPForm?.emailFrom || ''}
              onChange={handleInputChange}
            />
            {formErrors?.emailFrom && (
              <div className="invalid-feedback">
                {formErrors.emailFrom}
              </div>
            )}
          </div>
          <div className="col-md-12">
            <label htmlFor="bbcEmail" className="form-label mb-0 mt-2 text-dark">BBC Email</label>
            <input
              id="bbcEmail"
              type="text"
              name="bbcEmail"
              className={`form-control ${formErrors?.bbcEmail ? 'is-invalid' : ''}`}
              placeholder="Enter BBC Email"
              value={SMTPForm?.bbcEmail || ''}
              onChange={handleInputChange}
            />
            {formErrors?.bbcEmail && (
              <div className="invalid-feedback">
                {formErrors.bbcEmail}
              </div>
            )}
          </div>

        </form>
      </>
    ),
    Attendance: (
      <>
        <form>
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h5 className='mb-0'>Is Image Required</h5>
            <div className="form-check form-switch mt-3">
              <input
                className="form-check-input checkbox-large"
                type="checkbox"
                checked={attendanceForm?.image}
                onChange={(e) =>
                  setAttendanceForm({
                    ...attendanceForm,
                    image: e.target.checked,
                  })
                }
              />
            </div>
          </div>
        </form>
      </>
    )
  }

  useEffect(() => {
    if (punchData) {
      setAttendanceForm({
        image: punchData.image || ''
      });
    }
  }, [punchData]);

  useEffect(() => {
    if (smtpData) {
      setSMTPForm({
        host: smtpData.host || '',
        port: smtpData.port || '',
        userEmail: smtpData.userEmail || '',
        password: smtpData.password || '',
        fromName: smtpData.fromName || '',
        emailFrom: smtpData.emailFrom || '',
        bbcEmail: smtpData.bbcEmail || ''
      });
    }
  }, [smtpData]);

  return (
    <Layout>
      <section className="section dashboard">
        <div className="row">
          <div className="col-lg-12">
            <div className="pagetitle my-2">
              <h1>Settings</h1>
            </div>

            <div className="row">
            {permissionData?.companySmtp?.manageCompanySmtp &&
              <div className="col-lg-3 col-md-6 my-3" style={{ cursor: 'pointer' }}
                onClick={handleSMTPClick}
              >
                <div className="card info-card smtp-card p-2 m-0">
                  <div className="card-body py-0">
                    <div className="d-flex align-items-center py-2">
                      <div className="card-icon d-flex align-items-center justify-content-center">
                        <i className="fas fa-envelopes-bulk"></i>
                      </div>
                      <div className="ps-3">
                        <h5 className="card-title m-0 p-0">SMTP Settings</h5>
                        <span style={{ fontSize: '0.8rem' }}>Configure email server settings</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              }
              {permissionData?.companyAttendanceSettings?.manageCompanyAttendanceSettings &&
                <div className="col-lg-3 col-md-6 my-3" style={{ cursor: 'pointer' }}
                  onClick={handleAttendanceClick}
                >
                  <div className="card info-card smtp-card p-2 m-0">
                    <div className="card-body py-0">
                      <div className="d-flex align-items-center py-2">
                        <div className="card-icon d-flex align-items-center justify-content-center">
                          <i className="fas fa-user-gear"></i>
                        </div>
                        <div className="ps-3">
                          <h5 className="card-title m-0 p-0">Attendance Settings</h5>
                          <span style={{ fontSize: '0.8rem' }}>Manage attendance rules</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              }
            </div>
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
          handleSaveEdit={offcanvasType === 'SMTP' ? handleSaveSMTP : offcanvasType === 'Attendance' ? handleSaveAttendance : ''}
        />
      )}
    </Layout>
  );
};

export default Settting;