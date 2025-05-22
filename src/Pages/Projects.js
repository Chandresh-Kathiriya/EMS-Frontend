// src/Pages/Projects.js

// Import core modules
import React, { useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useSelector, useDispatch } from 'react-redux';
import Swal from 'sweetalert2';
import { PermissionContext } from '../Context/PermissionContext';

// Importing important components for page
import Layout from '../Components/Layout';  // Import Layout component
import DataTable from '../Components/DataTable';
import OffCanvas from '../Components/OffCanvas';
import FilterOffCanvas from '../Components/FilterOffCanvas';
import { apiCall } from '../Components/API'; // API call utility
import SelectInput from '../Components/SelectInput';

import { fetchProjectData } from '../redux/actions/projectActions';

function Projects() {
  const { permissionData } = useContext(PermissionContext);
  const [offcanvasType, setOffcanvasType] = useState(null);
  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const [showFilterOffcanvas, setFilterShowOffcanvas] = useState(false);
  const [projectId, setProjectId] = useState('');
  const [projectName, setProjectName] = useState('');
  const [projectStatus, setProjectStatus] = useState('');
  const [projectProgress, setProjectProgress] = useState('');
  const [file, setFile] = useState(null);
  const [filePath, setFilePath] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState(null);
  const [offcanvasTitle, setOffcanvasTitle] = useState('')
  const [per_page, setPer_page] = useState(10)
  const [page, setPage] = useState(1)
  const [total_page, setTotal_page] = useState('')

  // Check token is available in localstorage
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const userId = localStorage.getItem('id');

  // Redirect to login if token is not available
  if (!token) {
    toast.error('You must be logged in to view this page');
    window.location.href = '/login';
  }

  const initialFilter = () => {
    try {
      const filter = localStorage.getItem('projectFilter');
      return filter ? JSON.parse(filter) : {};
    } catch (error) {
      console.error('Error parsing projectFilter:', error);
      return {};
    }
  };

  const filter = initialFilter();
  const bgFilter = Object.values(filter).some(value => value != null && value !== '');

  const [projectFilterStatus, setProjectFilterStatus] = useState(() => {
    const filter = initialFilter();
    return filter.status || null;
  });

  // Columns definition for the DataTable
  const columns = [
    { Header: 'Project', accessor: 'name', sortable: true, },
    { Header: 'Progress', accessor: 'progress', sortable: true },
    { Header: 'Status', accessor: 'status', sortable: true },
  ];

  const statusOptions = [
    { value: 'Pending', label: 'Pending' },
    { value: 'In-Progress', label: 'In-Progress' },
    { value: 'Hold', label: 'Hold' },
    { value: 'Completed', label: 'Completed' },
    { value: 'Scraped', label: 'Scraped' },
  ];

  // Show filter offcanvas
  const handleFilterClick = () => {
    setFilterShowOffcanvas(true);
  };

  // Show new project offcanvas
  const handleNewProjectClick = () => {
    setProjectName('');
    setFilePath('')
    setProjectStatus('');
    setProjectProgress('');
    setOffcanvasType('new');
    setOffcanvasTitle('New Project')
    setShowOffcanvas(true);
  };

  // Handle file upload click
  const handleUploadClick = (e) => {
    e.preventDefault();
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.jpg, .jpeg, .png'; // Specify acceptable file types


    fileInput.onchange = async () => {
      const selectedFile = fileInput.files[0];
      if (selectedFile) {
        const fileExtension = selectedFile.name.split('.').pop().toLowerCase();
        if (['jpg', 'jpeg', 'png'].includes(fileExtension)) {

          const formData = new FormData();
          formData.append('file', selectedFile);

          try {
            // setLoading(true);
            const response = await apiCall('productivity/upload?fileFor=project', token, 'POST', formData);

            if (response) {
              setTimeout(() => {
                setFilePath(response.imageURL)
                setFile(response.imageName);
                // setLoading(false);
              }, 2000);
            } else {
              toast.error('File upload failed');
            }
          } catch (error) {
            const status = error?.response?.status;

            if (status === 401 || status === 403) {
              localStorage.removeItem('token');

              window.location.href = '/login'; // Force redirect to login
            } else {
              console.error('Error uploading file:', error);
              toast.error('Error uploading file: ' + error);
            }
          }

        } else {
          Swal.fire('Error!', 'Failed to upload file.', 'error');
        }
      }
    };
    fileInput.click(); // Simulate a click to open the file selector
  };

  // Form validation for new and edit projects
  const [formErrors, setFormErrors] = useState({
    projectName: false,
    projectStatus: false,
    projectProgress: false
  });

  // Save new project logic
  const handleSaveNewProject = async () => {
    let errors = {
      projectName: !projectName,
      projectStatus: !projectStatus,
      projectProgress: !projectProgress
    };

    setFormErrors(errors); // Set errors state

    if (Object.values(errors).includes(true)) {
      toast.error('Please fill all required fields');
      return;
    }

    const formData = {
      filePath,
      projectName,
      projectStatus: projectStatus.value,
      projectProgress: projectProgress.value
    };
    try {
      // Call the API to add the new project
      const response = await apiCall('productivity/addproject', token, 'POST', formData);

      // Check for success (you can adjust this based on your API response format)
      if (response && response.message === 'Project created successfully') {
        setShowOffcanvas(false); // Close offcanvas
        window.location.reload();
      } else {
        // Handle API error
        toast.error('Failed to create project. Please try again.');
      }
    } catch (error) {
      // Handle any other errors (network issues, etc.)
      toast.error('An error occurred while saving the project. Please try again.');
      console.error('Error saving project:', error);
    }
    setShowOffcanvas(false); // Close offcanvas
  };

  const dispatch = useDispatch();
  const { projectData, loading } = useSelector(
    (state) => state.project
  );


  // Save edited project logic
  const handleSaveEditProject = async () => {
    let errors = {
      projectName: !projectName,
      projectStatus: !projectStatus,
      projectProgress: !projectProgress,
    };

    setFormErrors(errors); // Set errors state

    if (Object.values(errors).includes(true)) {
      toast.error('Please fill all required fields');
      return;
    }

    const formData = {
      filePath,
      projectName,
      projectStatus: projectStatus.value,
      projectProgress: projectProgress.value
    };

    try {
      // Call the API to add the new project
      const response = await apiCall(`productivity/editProjectById/${projectId}`, token, 'POST', formData);

      // Check for success (you can adjust this based on your API response format)
      if (response) {
        toast.success(response)
        setShowOffcanvas(false); // Close offcanvas
        window.location.reload();
      } else {
        // Handle API error
        toast.error('Failed to create project. Please try again.');
      }
    } catch (error) {
      // Handle any other errors (network issues, etc.)
      toast.error('An error occurred while saving the project. Please try again.');
      console.error('Error saving project:', error);
    }
  };

  // Export data to CSV logic
  const exportToCSV = (data) => {
    const headers = Object.keys(data[0]);
    const updatedAtIndex = headers.indexOf('updatedAt');
    const filteredHeaders = updatedAtIndex !== -1 ? headers.slice(0, updatedAtIndex + 1) : headers;
    const rows = data.map(item =>
      filteredHeaders.map(header => item[header]).join(',')
    );
    const csvContent = [filteredHeaders.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'projects.csv'); // Define the file name
    document.body.appendChild(link);
    link.click(); // Trigger the download
    document.body.removeChild(link); // Clean up the link element
  };

  // Handle export button click
  const handleExportClick = async () => {
    const data = {
      page: 1,
    }

    const response = await apiCall(`productivity/project`, null, 'POST', data)

    if (response.data.length === 0) {
      toast.error('No data available to export');
      return;
    }

    exportToCSV(response.data); // Call export function with project data
    toast.success('Exporting data as CSV!');
  };

  // When editing, set the form values from the selected project
  const handleEditProject = (project) => {
    const status = { label: project.status, value: project.status }
    const progress = { label: project.progress, value: project.progress }
    setProjectId(project.id);
    setProjectName(project.name);
    setFilePath(project.imageURL)
    setProjectStatus(status);
    setProjectProgress(progress);
    setIsEditing(true); // Mark as editing
    setEditingProjectId(project.id); // Store the id of the project being edited
    setOffcanvasType('new'); // Keep the form in the same offcanvas style as "new"
    setOffcanvasTitle('Edit Project')
    setShowOffcanvas(true);
  };

  const handleDeleteProject = async (project) => {
    Swal.fire({
      title: "Are you sure?",
      text: `You want to delete this ${project.name}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!"
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await apiCall(`productivity/deleteProjectById/${project.id}`, token, 'POST', null);
          dispatch(fetchProjectData(token, per_page, page))
        } catch (error) {
        }
      }
    });
  }

  const handleNewStatus = (selectedOption) => {
    setProjectStatus(selectedOption);
  }

  const handleNewProgress = (selectedOption) => {
    setProjectProgress(selectedOption);
  }

  const saveLocalStorage = (key, val) => {
    let project = initialFilter();
    project[key] = val;
    localStorage.setItem('projectFilter', JSON.stringify(project));
  }

  // Offcanvas content for different modes (filter, new, edit)
  const offcanvasContent = {
    filter: (
      <>
        <div className="form-group">
          <label>Project Status</label>
          <SelectInput
            placeholder={'Select Status'}
            value={projectFilterStatus}
            onChange={(e) => {
              setProjectFilterStatus(e);
              saveLocalStorage("status", e ? e.value : null);
            }}
            options={statusOptions}
          />
        </div>
      </>
    ),
    new: (
      <>
        <form>
          <div className="upload-box" onClick={handleUploadClick} >
            {loading ? (
              <div className="spinner-border" role="status" style={{ color: '#338db5' }}>
                <span className="sr-only">Loading...</span>
              </div>
            ) : (
              <>
                {!filePath && <span>Upload Image</span>}
                {filePath && <img className="upload-box" src={filePath} alt="Logo" />}
              </>
            )}
          </div>
          <div className="form-group py-2">
            <label>Project Name</label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className={`form-control ${formErrors.projectName ? 'is-invalid' : ''}`}
              placeholder="Enter Project Name"
            />
            {formErrors.projectName && (
              <div className="invalid-feedback">Project name is required.</div>
            )}
          </div>

          <div className="form-group py-2">
            <label>Project Status</label>

            <SelectInput
              placeholder={'Select Option'}
              value={projectStatus}
              onChange={handleNewStatus}
              options={[{ value: 'Active', label: 'Active' },
              { value: 'Not Active', label: 'Not Active' },
              ]}
            />

          </div>

          <div className="form-group py-2">
            <label>Project Progress</label>

            <SelectInput
              placeholder={'Select Option'}
              value={projectProgress}
              onChange={handleNewProgress}
              options={statusOptions}
            />

          </div>
        </form>
      </>
    )
  };

  // Close offcanvas
  const handleCloseOffcanvas = async () => {
    if (file) {
      try {
        const response = await apiCall(`productivity/removeImageFromCloud?fileName=${file}`, null, 'GET', null)
        if (response) {
          setFilePath('')
          setFile('')
          setShowOffcanvas(false);
        }
      } catch (error) {
        console.error(error);
      }
    } else {
      setShowOffcanvas(false);
    }
  };

  const handleFilterCloseOffcanvas = () => {
    setFilterShowOffcanvas(false);
  };

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

  useEffect(() => {
    if (token) {
      let user;
      if (role === 'Admin') {
        user = null;
      } else {
        user = userId
      }
      dispatch(fetchProjectData(token, per_page, page, user, projectFilterStatus?.value));
    }
  }, [token, per_page, page, dispatch, projectFilterStatus]);

  useEffect(() => {
    if (projectData.pagination) {
      setPage(projectData.pagination.page);
      setTotal_page(projectData.pagination.total_pages);
    }
  }, [projectData.pagination]);

  return (
    <Layout>
      <section className="section">

        <div className="row mb-3">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', alignContent: 'center' }}>
            <h3 className='mb-0'>Projects</h3>
            <div className=''>
              {permissionData?.project?.canAddProject &&
                <button
                  type="button"
                  className="btn mx-1 mt-0"
                  onClick={handleNewProjectClick} // Show new project offcanvas
                  style={{ color: '#338db5', border: '1px solid #338db5' }}
                >
                  <i className="fa-solid fa-circle-plus"></i>&nbsp;Project
                </button>
              }
              <button
                type="button"
                className="btn mx-1 mt-0"
                onClick={handleFilterClick} // Show filter offcanvas
                style={{
                  color: '#338db5', border: '1px solid #338db5',
                  backgroundColor: bgFilter ? '#dbf4ff' : 'transparent'
                }}
              >
                <i className="fa-solid fa-bars"></i>&nbsp;Filters
              </button>
              <button
                type="button"
                className="btn mx-1 mt-0"
                onClick={handleExportClick} // Export functionality
                style={{ color: '#338db5', border: '1px solid #338db5' }}
              >
                <i className="fa-solid fa-cloud-arrow-down"></i>&nbsp;Export
              </button>
            </div>
          </div>
        </div>

        <div className='row'>
          <div className="col-lg-12">
            <DataTable
              columns={columns}
              data={projectData.data}
              pagination={projectData.pagination}
              onClickPrevious={handlePreviousClick}
              onClickNext={handleNextClick}
              onPageSizeChange={handlePageSizeChange}
              onEdit={handleEditProject}
              editButton={(permissionData?.project?.canUpdateProject)} // Enable edit button
              onDelete={handleDeleteProject}
              deleteButton={(permissionData?.project?.canUpdateProject)} // Enable delete button
              footer={true}
            />
          </div>
        </div>

        {/* Offcanvas Component for new and edit project */}
        {showOffcanvas && (
          <OffCanvas
            title={offcanvasTitle}
            content={offcanvasContent[offcanvasType]}
            onClose={handleCloseOffcanvas}
            handleCloseOffcanvas={handleCloseOffcanvas}
            handleSaveEdit={offcanvasTitle === 'New Project' ? handleSaveNewProject : offcanvasTitle === 'Edit Project' ? handleSaveEditProject : ''}
          />
        )}

        {showFilterOffcanvas && (
          <FilterOffCanvas
            title={'Project'}
            content={offcanvasContent['filter']}
            onClose={handleFilterCloseOffcanvas}
            handleCloseOffcanvas={handleFilterCloseOffcanvas}
            handleClearAll={() => {
              saveLocalStorage("status", null)
              setProjectFilterStatus(null)
            }}
          />
        )}

      </section>
    </Layout>
  );
}

export default Projects;