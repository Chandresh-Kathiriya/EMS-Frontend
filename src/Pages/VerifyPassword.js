// src/Pages/VerifyPassword.js

// Import core module
import React, { useState } from 'react';
import 'react-toastify/dist/ReactToastify.css';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

// Import Company's logo
import img_jiyantech from '../Images/jiyantech.logo.svg';
import img_reset from '../Images/resetpassword.png';
import { toast } from 'react-toastify';
import { apiCall } from '../Components/API';


function VerifyPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [formValues, setFormValues] = useState({
    password: "",
    confirmpassword: '',
  });
  const [formErrors, setFormErrors] = useState({
    password: '',
    confirmpassword: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = {};

    if (!formValues.password) {
      errors.password = 'Password Required';
    }

    if (!formValues.confirmpassword) {
      errors.confirmpassword = 'Confirm Password Required';
    }

    if (
      formValues.password &&
      formValues.confirmpassword &&
      formValues.password !== formValues.confirmpassword
    ) {
      errors.confirmpassword = 'Password are not match';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    } else {
      try {
        const data = {
          password: formValues.password,
          token: token
        }
        const verify = await apiCall('common/verifyPassword', null, 'POST', data)
        if (verify?.message === 'Password reset successful') {
          toast.success(verify.message)
          navigate('/login');
        } else {
          toast.error(verify.message)
        }
      } catch (error) {
        console.log(error)
      }
    }
  };

  return (
    <>
      <main>
        <div className="container ">
          <section className="section register min-vh-100 d-flex align-items-center justify-content-center">
            <div className="container ">
              <div className="row" style={{ height: '100vh', width: '100vw' }}>
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
                        {/* Password Field */}
                        <div className="col-12">
                          <label htmlFor="password" className="form-label">Password:</label>
                          <input
                            type="password"
                            name="password"
                            className={`form-control ${formErrors?.password ? 'is-invalid' : ''}`}
                            id="password"
                            value={formValues.password}
                            onChange={(e) => {
                              const { value } = e.target;
                              setFormValues((prev) => ({ ...prev, password: value }));
                              setFormErrors((prev) => ({ ...prev, password: '' }));
                            }}
                          />
                          {formErrors?.password && <div className="invalid-feedback">{formErrors.password}</div>}
                        </div>

                        {/* Confirm Password Field */}
                        <div className="col-12">
                          <label htmlFor="confirmpassword" className="form-label">Confirm Password:</label>
                          <input
                            type="password"
                            name="confirmpassword"
                            className={`form-control ${formErrors?.confirmpassword ? 'is-invalid' : ''}`}
                            id="confirmpassword"
                            value={formValues.confirmpassword}
                            onChange={(e) => {
                              const { value } = e.target;
                              setFormValues((prev) => ({ ...prev, confirmpassword: value }));
                              setFormErrors((prev) => ({ ...prev, confirmpassword: '' }));
                            }}
                          />
                          {formErrors?.confirmpassword && <div className="invalid-feedback">{formErrors.confirmpassword}</div>}
                        </div>

                        {/* Submit Button */}
                        <div className="col-12 mt-3 mb-2">
                          <button className="btn btn-primary w-100" type="submit">Reset Password</button>
                        </div>
                      </form>
                    </div>
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

export default VerifyPassword;