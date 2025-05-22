// src/Pages/Login.js

// Import core module
import React, { useState } from 'react';
import { toast } from 'react-toastify'; // Import toast and ToastContainer
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { fetchPermissionData } from '../redux/actions/commonAction';

// Import Company's logo
import img_jiyantech from '../Images/jiyantech.logo.svg';

// Import require components
import { apiCall } from '../Components/API';

function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [formValues, setFormValues] = useState({
    email: "",
    password: "",
    remember: false
  });

  // Handle Input event when user enter value 
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormValues({ ...formValues, [name]: type === 'checkbox' ? checked : value });
  };

  // Handle Submit button event
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // API call to login
      const response = await apiCall('common/login', null, 'POST', formValues); // Pass null for token when not available

      // Check if the response has data and status
      if (response && response.message) {

        // Check if the response message indicates successful login
        if (response.message === 'Login successful') {
          // Store user role and token in localStorage
          const userData = response.user;
          const userDetail = ['id', 'role', 'token', 'userName', 'empCode', 'userEmail'];

          userDetail.forEach(key => {
            localStorage.setItem(key, userData[key]);
          });

          const token = userData.token;
          if (token) {
            await dispatch(fetchPermissionData(token));
          }

          toast.success(response.message); // Show success toast
          navigate('/');
        } else {
          // If login failed
          toast.error(response.message || 'Login failed');
        }
      } else if (response && response.status === 401) {
        // Handle Unauthorized error from the API
        toast.error(response.message || 'Invalid credentials');
      } else {
        // Handle cases where no data or status is available
        toast.error('Invalid credentials');
      }
    } catch (error) {
      console.log(error)
      console.error('Error during API call:', error);  // Log the error for debugging
      if (error.response) {
        // API responded with a status other than 2xx
        toast.error(`API Error: ${error.response?.message || 'Something went wrong'}`);
      } else if (error.request) {
        // No response received
        toast.error('Request Error:', error.request); // Log the entire request object for better understanding
        console.log(error.request)

        // Check if it has any properties like `status` or `statusText` that could provide more info
        if (error.request.status) {
          toast.error('Request status:', error.request.status);
        }
        if (error.request.statusText) {
          toast.error('Request statusText:', error.request.statusText);
        }

      } else {
        // Some other error
        toast.error(`Error: ${error.message || 'Unknown error occurred'}`);
      }
    }
  };

  return (
    <>
      <main>
        <div className="container">
          <section className="section register min-vh-100 d-flex flex-column align-items-center justify-content-center py-4">
            <div className="container">
              <div className="row justify-content-center">
                <div className="col-lg-4 col-md-6 d-flex flex-column align-items-center justify-content-center">
                  <div className="card mb-3 p-4">
                    <div className="card-body">
                      <div className="pb-2">
                        <div className='d-flex justify-content-center'>
                          <img src={img_jiyantech} alt="Logo" style={{ width: '100%', maxWidth: '80%', height: 'auto' }} />
                        </div>
                        <h5 className="card-title text-center pb-0 fs-4">Welcome Back! Please enter your details</h5>
                      </div>

                      <form className="row g-3 needs-validation" onSubmit={handleSubmit}>
                        <div className="col-12">
                          <label htmlFor="yourEmail" className="form-label">Email:</label>
                          <div className="input-group has-validation">
                            <input
                              type="email"
                              name="email"
                              className="form-control"
                              id="yourEmail"
                              value={formValues.email}
                              onChange={handleInputChange}
                              required
                            />
                          </div>
                        </div>
                        <div className="col-12">
                          <label htmlFor="yourPassword" className="form-label">Password:</label>
                          <input
                            type="password"
                            name="password"
                            autoComplete=" "
                            className="form-control"
                            id="yourPassword"
                            value={formValues.password}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                        <div className="col-6">
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              name="remember"
                              checked={formValues.remember}
                              id="rememberMe"
                              onChange={handleInputChange}
                            />
                            <label className="form-check-label" htmlFor="rememberMe">Remember me</label>
                          </div>
                        </div>
                        <div className="col-6 text-end">
                          <p className="small mb-0">
                            <a href="/reset-password">Forgot Password?</a>
                          </p>
                        </div>
                        <div className="col-12 mt-5">
                          <button className="btn btn-primary w-100" type="submit">Login</button>
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

export default Login;