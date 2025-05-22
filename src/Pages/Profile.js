// src/Pages/Profile.js

// import core module
import React, { useState, useEffect } from 'react';
import 'react-toastify/dist/ReactToastify.css';
// import { toast } from 'react-toastify'; 

// import require componets
import { apiCall } from '../Components/API';
import Layout from '../Components/Layout';

// import require image
import img_small_jiyantech from '../Images/JiyanTech.png';

function Profile() {
  const userID = localStorage.getItem('id');
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = '/login';
  }

  const [role, setRole] = useState(null);
  useEffect(() => {
    const role = localStorage.getItem('role');
    setRole(role);
  }, []);

  const [editUserForm, setEditUserForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // const [tempUserForm, setTempUserForm] = useState(null); 
  // const [currentPassword, setCurrentPassword] = useState('');
  // const [newPassword, setNewPassword] = useState('');
  // const [confirmNewPassword, setConfirmNewPassword] = useState('');
  // const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true)
        const response = await apiCall(`profile/${userID}`, token, 'GET', null);
        setEditUserForm(response);
        // setTempUserForm(response); // Initialize tempUserForm with fetched data
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch user data');
        setLoading(false);
      }
    };
    fetchUserData();
  }, [token]);
  
  if (loading) {
    return <div>Loading...</div>;
  }

  // const handleInputChange = (e) => {
  //   const { name, value } = e.target;
  //   setTempUserForm({ ...tempUserForm, [name]: value }); // Update the temporary state
  // };

  // const handleEditProfileSubmit = async (e) => {
  //   e.preventDefault();  // Prevent the default form submission behavior

  //   try {

  //     // Make API call to update the profile
  //     const response = await apiCall(`profile/edit/${userID}`, token, 'PUT', tempUserForm);

  //     setEditUserForm(tempUserForm); // If successful, update the frontend with the changes
  //     toast.success(response.message);

  //     const overviewTab = document.querySelector('[data-bs-target="#profile-overview"]');
  //     if (overviewTab) {
  //       overviewTab.click();  // Trigger a click event to switch the tab
  //     }
  //   } catch (err) {
  //     console.error('Error updating profile:', err);
  //     alert('Error updating profile: ' + err);  // Show error message if update fails
  //   }
  // };

  // const handleReset = () => {
  //   // Reset form to initial data
  //   setTempUserForm({ ...editUserForm });
  // };

  // const handleChangePasswordSubmit = async (e) => {
  //   e.preventDefault();

  //   try {
      
  //     const formData = {currentPassword, newPassword}
  //     // Send the API request to change the password
  //     const response = await apiCall(`profile/change-password/${userID}`, token, 'PUT', formData);

  //     setCurrentPassword('');
  //     setNewPassword('');
  //     setConfirmNewPassword('');
  //     setPasswordError('');

  //     // If successful, display a success toast message
  //     toast.success(response.message);  // Assuming response.message is the success message
  //     const overviewTab = document.querySelector('[data-bs-target="#profile-overview"]');
  //     if (overviewTab) {
  //       overviewTab.click();  // Trigger a click event to switch the tab
  //     }
    
  //   } catch (err) {
  //     console.error(err);

  //     // If error response, display the error toast message
  //     if (err.response && err.response.data) {
  //       toast.error(err.response.data.message || 'Error changing password');
  //     } else {
  //       toast.error('Error changing password');
  //     }
  //   }
  // };



  if (error) {
    return <div>{error}</div>;
  }

  return (
    <>
      <Layout>
        <div className="pagetitle">
          <h1>Profile</h1>
        </div>
        <section className="section profile">
          <div className="row">
            <div className="col-xl-4">
              <div className="card">
                <div className="card-body profile-card pt-4 d-flex flex-column align-items-center">
                  <img src={img_small_jiyantech} alt="Profile" className="rounded-circle" />
                  <h2>{editUserForm.full_name}</h2>
                  <h3>{role}</h3>
                </div>
              </div>
            </div>
            <div className="col-xl-8">
              <div className="card">
                <div className="card-body pt-3">
                  <ul className="nav nav-tabs nav-tabs-bordered">
                    <li className="nav-item">
                      <button className="nav-link active" data-bs-toggle="tab" data-bs-target="#profile-overview">Overview</button>
                    </li>
                    {/* <li className="nav-item">
                      <button className="nav-link" data-bs-toggle="tab" data-bs-target="#profile-edit">Edit Profile</button>
                    </li>
                    <li className="nav-item">
                      <button className="nav-link" data-bs-toggle="tab" data-bs-target="#profile-change-password">Change Password</button>
                    </li> */}
                  </ul>
                  <div className="tab-content pt-2">
                    <div className="tab-pane fade show active profile-overview" id="profile-overview">
                      <h5 className="card-title">Profile Details</h5>
                      <div className="row">
                        <div className="col-lg-3 col-md-4 label">Full Name</div>
                        <div className="col-lg-9 col-md-8">{editUserForm.full_name}</div>
                      </div>
                      <div className="row">
                        <div className="col-lg-3 col-md-4 label">Email</div>
                        <div className="col-lg-9 col-md-8">{editUserForm.email}</div>
                      </div>
                      <div className="row">
                        <div className="col-lg-3 col-md-4 label">Date Of Birth</div>
                        <div className="col-lg-9 col-md-8">{editUserForm.dateOfBirth}</div>
                      </div>
                      <div className="row">
                        <div className="col-lg-3 col-md-4 label">Employee ID</div>
                        <div className="col-lg-9 col-md-8">{editUserForm.empCode}</div>
                      </div>
                      <div className="row">
                        <div className="col-lg-3 col-md-4 label">Role Name</div>
                        <div className="col-lg-9 col-md-8">{editUserForm.roleName}</div>
                      </div>
                      <div className="row">
                        <div className="col-lg-3 col-md-4 label">Date of Joining</div>
                        <div className="col-lg-9 col-md-8">{editUserForm.dateOfJoining}</div>
                      </div>
                      <div className="row">
                        <div className="col-lg-3 col-md-4 label">Gender</div>
                        <div className="col-lg-9 col-md-8">{editUserForm.gender}</div>
                      </div>
                      <div className="row">
                        <div className="col-lg-3 col-md-4 label">Mobile No</div>
                        <div className="col-lg-9 col-md-8">{editUserForm.mobileNo}</div>
                      </div>
                    </div>

                    {/* Edit Profile form */}
                    {/* <div className="tab-pane fade profile-edit pt-3" id="profile-edit">
                      <form onSubmit={handleEditProfileSubmit}>
                        <div className="row mb-3">
                          <label htmlFor="fullName" className="col-md-4 col-lg-3 col-form-label">Full Name</label>
                          <div className="col-md-8 col-lg-9">
                            <input
                              name="full_name"
                              type="text"
                              className="form-control"
                              id="fullName"
                              value={tempUserForm.full_name}
                              onChange={handleInputChange}
                            />
                          </div>
                        </div>
                        
                        <div className="row mb-3">
                          <label htmlFor="empCode" className="col-md-4 col-lg-3 col-form-label">Employee ID</label>
                          <div className="col-md-8 col-lg-9">
                            <input
                              name="empCode"
                              type="text"
                              className="form-control"
                              id="empCode"
                              value={tempUserForm.empCode}
                              onChange={handleInputChange}
                              disabled
                            />
                          </div>
                        </div>
                        <div className="row mb-3">
                          <label htmlFor="userEmail" className="col-md-4 col-lg-3 col-form-label">Email</label>
                          <div className="col-md-8 col-lg-9">
                            <input
                              name="email"
                              type="email"
                              className="form-control"
                              id="userEmail"
                              value={tempUserForm.email}
                              onChange={handleInputChange}
                              disabled
                            />
                          </div>
                        </div>
                        <div className="row mb-3">
                          <label htmlFor="roleName" className="col-md-4 col-lg-3 col-form-label">Role</label>
                          <div className="col-md-8 col-lg-9">
                            <select
                              className="form-select"
                              aria-label="Default select example"
                              value={tempUserForm.roleName}
                              onChange={handleInputChange}
                              disabled
                            >
                              <option disabled>Select</option>
                              <option value="Admin">Admin</option>
                              <option value="Manager">Manager</option>
                              <option value="Employee">Employee</option>
                            </select>
                          </div>
                        </div>
                        <div className="row mb-3">
                          <label htmlFor="status" className="col-md-4 col-lg-3 col-form-label">Status</label>
                          <div className="col-md-8 col-lg-9">
                            <select
                              name='status'
                              className="form-select"
                              aria-label="Default select example"
                              value={tempUserForm.status}
                              onChange={handleInputChange}
                            >
                              <option  disabled>Select</option>
                              <option value="Active">Active</option>
                              <option value="Not Active">Not Active</option>
                            </select>
                          </div>
                        </div>
                        <div className="row mb-3">
                          <label htmlFor="parentID" className="col-md-4 col-lg-3 col-form-label">Parent ID</label>
                          <div className="col-md-8 col-lg-9">
                            <input
                              name="parentID"
                              type="number"
                              className="form-control"
                              id="parentID"
                              value={tempUserForm.parentID}
                              onChange={handleInputChange}
                              disabled
                            />
                          </div>
                        </div>
                        <div className="text-center">
                          <button type="submit" className="btn btn-primary mx-2">Save Changes</button>
                          <button type="reset" className="btn btn-secondary mx-2" onClick={handleReset}>Reset</button>
                        </div>
                      </form>
                    </div> */}

                    {/* Change Password form */}
                    {/* <div className="tab-pane fade pt-3" id="profile-change-password">
                      <form onSubmit={handleChangePasswordSubmit}>
                        <div className="row mb-3">
                          <label htmlFor="currentPassword" className="col-md-4 col-lg-3 col-form-label">Current Password</label>
                          <div className="col-md-8 col-lg-9">
                            <input
                              name="currentPassword"
                              type="password"
                              className="form-control"
                              id="currentPassword"
                              value={currentPassword}
                              onChange={(e) => setCurrentPassword(e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="row mb-3">
                          <label htmlFor="newPassword" className="col-md-4 col-lg-3 col-form-label">New Password</label>
                          <div className="col-md-8 col-lg-9">
                            <input
                              name="newPassword"
                              type="password"
                              className="form-control"
                              id="newPassword"
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="row mb-3">
                          <label htmlFor="confirmNewPassword" className="col-md-4 col-lg-3 col-form-label">Re-enter New Password</label>
                          <div className="col-md-8 col-lg-9">
                            <input
                              name="confirmNewPassword"
                              type="password"
                              className="form-control"
                              id="confirmNewPassword"
                              value={confirmNewPassword}
                              onChange={(e) => setConfirmNewPassword(e.target.value)}
                            />
                          </div>
                        </div>
                        {passwordError && <div className="text-danger">{passwordError}</div>}
                        <div className="text-center">
                          <button type="submit" className="btn btn-primary">Change Password</button>
                        </div>
                      </form>
                    </div> */}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </Layout>
    </>
  );
}

export default Profile;
