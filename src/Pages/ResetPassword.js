// src/Pages/ResetPassword.js

// Import core module
import React, { useState } from 'react';
import 'react-toastify/dist/ReactToastify.css';

// Import Company's logo
import img_jiyantech from '../Images/jiyantech.logo.svg';
import img_reset from '../Images/resetpassword.png';
import { toast } from 'react-toastify';
import { apiCall } from '../Components/API';
import { useNavigate } from 'react-router-dom';


function ResetPassword() {
  const navigate = useNavigate();
  const [formValues, setFormValues] = useState({
    email: "",
  });
  const [formErrors, setFormErrors] = useState({
    email: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = {};

    if (!formValues.email?.trim()) {
      errors.email = 'Email Required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formValues.email)) {
      errors.email = 'Invalid Email Format';
    }
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    } else {
      try {
        const sendLink = await apiCall('common/resetPasword', null, 'POST', formValues)
        if (sendLink?.message == 'User not found') {
          toast.error(sendLink.message)
        } else {
          toast.success('Password reset link sent successful');
          navigate('/login');
        }
      } catch (error) {
        console.log(error)
      }
    }
  };

  return (
    <>
      <main>
        <div className="container-fluid">
          <section className="section register min-vh-100 d-flex align-items-center justify-content-center">
            <div className="row w-100 m-0" style={{ height: '100vh' }}>
              {/* Left Side - Image */}
              <div className="col-md-6 d-none d-md-flex align-items-center justify-content-center px-0" style={{ height: '100vh' }}>
                <img
                  src={img_reset}
                  alt="Logo"
                  style={{ height: '100%', width: '100%', objectFit: 'cover' }}
                />
              </div>

              {/* Right Side - Form */}
              <div className="col-md-6 col-12 d-flex align-items-center justify-content-center px-0" style={{ height: '100vh' }}>
                <div className="card w-100 h-auto m-4" style={{ maxWidth: '400px', width: '80%' }}>
                  <div className="card-body p-4">
                    <div className='d-flex justify-content-center'>
                      <img src={img_jiyantech} alt="Logo" style={{ width: '200px', height: 'auto' }} />
                    </div>
                    <h5 className="card-title text-center pb-0 fs-4">Reset Password</h5>
                    <p className="text-center pb-0 fs-4 custom-font-size">Welcome Back! Please enter your Password</p>

                    <form className="row mb-0 needs-validation" onSubmit={handleSubmit}>
                      <div className="col-12">
                        <label htmlFor="email" className="form-label">Email:</label>
                        <input
                          type="text"
                          name="email"
                          className={`form-control ${formErrors?.email ? 'is-invalid' : ''}`}
                          id="email"
                          value={formValues.email}
                          onChange={(e) => {
                            const { value } = e.target;
                            setFormValues((prev) => ({ ...prev, email: value }));
                            setFormErrors((prev) => ({ ...prev, email: '' }));
                          }}
                        />
                        {formErrors?.email && (
                          <div className="invalid-feedback">{formErrors.email}</div>
                        )}
                      </div>
                      <div className="col-12 mt-3 mb-4">
                        <button className="btn btn-primary w-100" type="submit">Reset Password</button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}

export default ResetPassword;