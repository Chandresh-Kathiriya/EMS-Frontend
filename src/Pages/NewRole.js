// src/Pages/NewRole.js

// import core module
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';

// import require components
import Layout from '../Components/Layout';
import { apiCall } from '../Components/API';
import { decryptId } from '../encryption';

function NewRole() {
  const navigate = useNavigate();
  const { encryptedRoleID } = useParams();
  const [roleId, setRoleId] = useState(null);
  const [permissions, setPermissions] = useState({});
  const [roleName, setRoleName] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const token = localStorage.getItem('token')

  // Helper function to convert API permissions to component format
  const transformApiPermissions = (apiPermissions) => {
    return Object.entries(apiPermissions).reduce((acc, [category, permsObj]) => {
      acc[category] = Object.entries(permsObj).map(([permKey, checked]) => ({
        name: permKey,
        checked
      }));
      return acc;
    }, {});
  };

  useEffect(() => {
    const decryptAndSetRoleId = () => {
      if (encryptedRoleID) {
        const id = decryptId(encryptedRoleID);
        setRoleId(id);
      }
    };
    decryptAndSetRoleId();
  }, [encryptedRoleID]);

  useEffect(() => {
    const fetchData = async (token) => {
      setIsLoading(true);
      try {
        // Fetch permission schema
        const schemaResponse = await apiCall('users/getPermissionSchema', token, 'GET');

        if (!schemaResponse?.getData) {
          toast.error('Failed to load permission schema');
          return;
        }

        // Create initial permissions structure
        const initialPermissions = schemaResponse.getData.reduce((acc, item) => {
          const { title, permission } = item;
          if (!acc[title]) {
            acc[title] = [];
          }
          acc[title].push({
            name: permission,
            checked: false
          });
          return acc;
        }, {});

        // If editing, fetch role data and update permissions
        if (roleId) {
          const roleResponse = await apiCall(`users/getRole/${roleId}`, token, 'GET');

          if (roleResponse?.role) {
            setRoleName(roleResponse.role.name);
            // Transform API permissions to component format
            const transformedPermissions = transformApiPermissions(roleResponse.role.permissions);
            setPermissions(transformedPermissions);
          } else {
            setPermissions(initialPermissions);
          }
        } else {
          // For new role, just set the initial permissions
          setPermissions(initialPermissions);
        }
      } catch (error) {
        toast.error(error.message || 'Failed to load data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData(token);
  }, [roleId, token]);

  const handleToggle = (category, permissionName) => {
    setPermissions(prev => ({
      ...prev,
      [category]: prev[category].map(perm =>
        perm.name === permissionName ? { ...perm, checked: !perm.checked } : perm
      )
    }));
  };

  // Helper function to convert component permissions to API format
  const transformToApiFormat = (componentPermissions) => {
    // Helper function to convert to camelCase
    const toCamelCase = (str) => {
      return str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, (match, index) => {
        if (+match === 0) return ""; // or if (/\s+/.test(match)) for white spaces
        return index === 0 ? match.toLowerCase() : match.toUpperCase();
      }).replace(/\s+/g, '');
    };
  
    return Object.entries(componentPermissions).reduce((acc, [category, perms]) => {
      const camelCategory = toCamelCase(category);
      acc[camelCategory] = perms.reduce((catAcc, perm) => {
        const camelPermName = toCamelCase(perm.name);
        catAcc[camelPermName] = perm.checked;
        return catAcc;
      }, {});
      return acc;
    }, {});
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!roleName.trim()) return toast.error('Role name is required');

    const formattedPermissions = transformToApiFormat(permissions);

    const roleData = {
      roleName: roleName.trim(),
      permissions: formattedPermissions
    };

    try {
      const endpoint = roleId ? `users/updateRole/${roleId}` : 'users/addNewRole';
      const method = roleId ? 'POST' : 'POST';

      const response = await apiCall(endpoint, token, method, roleData);
      toast.success(response.message);
      navigate('/users/manageroles');
    } catch (error) {
      toast.error(error.message || 'Operation failed');
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="text-center mt-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <h4 className="mt-4"><strong>{roleId ? 'Edit Role' : 'New Role'}</strong></h4>
      <div className="col-lg-6">
        <div className="card">
          <div className="card-body">
            <form onSubmit={handleSave}>
              <h5 className="mt-4"><strong>Role Name</strong></h5>
              <div className="col-lg-12 mb-3">
                <input
                  type="text"
                  className="form-control"
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value)}
                  placeholder="Enter Role Name"
                  required
                />
              </div>

              {Object.entries(permissions).map(([category, perms]) => (
                <div key={category} className="mb-4">
                  <h5 className="mt-4 mb-3">
                    {category.charAt(0).toUpperCase() + category.slice(1).replace(/([A-Z])/g, ' $1')}
                  </h5>
                  {perms.map((perm) => (
                    <div 
                      key={perm.name} 
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                      className="mb-2"
                    >
                      <h6 style={{ margin: 0 }}>
                        {perm.name.charAt(0).toUpperCase() + perm.name.slice(1).replace(/([A-Z])/g, ' $1')}
                      </h6>
                      <label className="form-check form-switch">
                        <input
                          className="form-check-input checkbox-large"
                          type="checkbox"
                          checked={perm.checked || false}
                          onChange={() => handleToggle(category, perm.name)}
                        />
                      </label>
                    </div>
                  ))}
                </div>
              ))}

              <button type="submit" className="btn btn-primary">
                {roleId ? 'Update Role' : 'Create Role'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default NewRole;