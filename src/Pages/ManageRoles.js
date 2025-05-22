// src/Pages/ManageRoles

// import core modules
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { encryptId } from '../encryption';

// import require components
import Layout from '../Components/Layout';
import { apiCall } from '../Components/API';

function ManageRoles() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login';
    } else {
      getProjectData(token);
    }
  }, []);

  // Fetch project data from the API
  const getProjectData = async (token) => {
    setLoading(true);
    try {
      const response = await apiCall('users/getRoleData', token, 'GET', null);
      if (response) {
        setRoles(response.roles);
        setIsOpen(new Array(response.roles.length).fill(false));
      } else {
        toast.error('Failed to fetch roles data');
      }
    } catch (error) {
      toast.error('Error fetching data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const toggleRole = (index) => {
    setIsOpen(prevState => {
      const updatedState = [...prevState];
      updatedState[index] = !updatedState[index];
      return updatedState;
    });
  };

  const handleNewRole = () => {
    navigate(`/users/newrole`);
  }

  // Function to handle role deletion
  const handleDeleteButton = async (roleIndex) => {
    const role = roles[roleIndex];

    Swal.fire({
      title: "Are you sure?",
      text: `You want to delete the role "${role.name}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!"
    }).then(async (result) => {
      if (result.isConfirmed) {

        setLoading(true); // Start loading state

        try {
          // Send API call to delete the role
          const response = await apiCall(`users/deleteRole/${role.id}`, null, 'POST', null);

          if (response) {
            Swal.fire({
              title: "Deleted!",
              text: "Role has been deleted.",
              icon: "success"
            });
            window.location.reload();

          } else {
            toast.error('Failed to delete the role.');
          }
        } catch (error) {
          toast.error('Error occurred while deleting the role.');
          console.error(error);
        } finally {
          setLoading(false);
        }
      }
    });
  };



  return (
    <Layout>
      <div className="container-fluid px-2">
        <div className="col-lg-10">
          <div className="pagetitle my-2 mx-2 mt-4" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}
          >
            <h4 className='mb-0'><strong>Manage Access</strong></h4>
            <div>
              <button
                type="button"
                className="btn mt-0"
                onClick={handleNewRole}
                style={{ color: '#338db5', border: '1px solid #338db5' }}
              >
                <i className="fa-solid fa-plus"></i>&nbsp;New Role
              </button>
            </div>
          </div>

          <div className="card pt-4">
            <div className="card-body p-0 p-md-4">
              {loading ? (
                <div>Loading...</div>
              ) : (
                roles.map((role, roleIndex) => (
                  role.isDeleted === 0 && (
                    <div className="container-fluid d-flex justify-content-center px-2"
                      key={roleIndex}>
                      <div className="col-12 col-md-10">
                        <div className='mb-3 p-2' style={{ border: '1px solid #d1d1d1', borderRadius: '8px', backgroundColor: '#cce7f2' }}>
                          <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center">
                            <h5 className='mb-0'><i className="fa-solid fa-user-shield" style={{ color: "#338db5" }}></i>&nbsp;&nbsp;{role.name}</h5>
                            <div className="d-flex flex-wrap gap-2 mt-2 mt-md-0">
                              {role.name !== 'Admin' && (
                                <>
                                  <a className='btn mt-0' href={`/users/editrole/${encryptId(role.id)}`} style={{ color: '#338db5' }}>
                                    <i className="fa-solid fa-pen"></i>
                                  </a>
                                  <button className="btn mt-0" style={{ color: '#fd6e6e' }} onClick={() => handleDeleteButton(roleIndex)} >
                                    <i className="fa-solid fa-trash"></i>
                                  </button>
                                </>
                              )}
                              <button className='btn mt-0' onClick={() => toggleRole(roleIndex)}>
                                {isOpen[roleIndex] ? <i className="fa-solid fa-chevron-up"></i> : <i className="fa-solid fa-chevron-down"></i>}
                              </button>
                            </div>
                          </div>
                        </div>
                        {isOpen[roleIndex] && (
                          <div className='col-lg-12'>
                            <div className="mb-3 px-3" style={{ border: '1px solid #d1d1d1', borderRadius: '8px', backgroundColor: '#edf7fb' }}>

                              {/* Iterate over each category of permissions */}
                              {Object.keys(role.permissions).map((category) => (
                                <div key={category}>
                                  <h5 className='pt-4'>{category.charAt(0).toUpperCase() + category.slice(1).replace(/([A-Z])/g, ' $1')}</h5>
                                  {/* Iterate over the permissions within that category */}
                                  {Object.keys(role.permissions[category]).map((permKey) => (
                                    <div key={permKey} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                      <h6>{`${permKey.charAt(0).toUpperCase() + permKey.slice(1).replace(/([A-Z])/g, ' $1')}`}</h6>
                                      <label className="form-check form-switch">
                                        <input
                                          className="form-check-input checkbox-large"
                                          type="checkbox"
                                          checked={role.permissions[category][permKey]}
                                          // onChange={() => handleToggle(roleIndex, category, permKey)}
                                          disabled
                                        />
                                      </label>
                                    </div>
                                  ))}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )))
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default ManageRoles;