import React, { useContext, useEffect, useState } from 'react';
import Layout from '../../Components/Layout';
import { useDispatch, useSelector } from 'react-redux';
import { PermissionContext } from '../../Context/PermissionContext';
import { fetchProjectData } from '../../redux/actions/projectActions';
import { toast } from 'react-toastify';

import { apiCall } from '../../Components/API';
import ProjectHeader from './Components/ProjectHeader';
import ProjectTable from './Components/ProjectTable';
import ProjectOffcanvas from './Components/ProjectOffcanvas';
import FilterOffCanvas from '../../Components/FilterOffCanvas';
import ProjectFilter from './Components/ProjectFilter';
import Swal from 'sweetalert2';

function Projects() {
  const dispatch = useDispatch();
  const { permissionData } = useContext(PermissionContext);
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const userId = localStorage.getItem('id');

  const [page, setPage] = useState(1);
  const [per_page, setPer_page] = useState(10);
  const [total_page, setTotal_page] = useState('');
  const [projectFilterStatus, setProjectFilterStatus] = useState(null);
  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const [showFilterOffcanvas, setShowFilterOffcanvas] = useState(false);
  const [offcanvasTitle, setOffcanvasTitle] = useState('');
  const [editingProject, setEditingProject] = useState(null);
  const [offcanvasType, setOffcanvasType] = useState('new');
  const [file, setFile] = useState(null);
  const [filePath, setFilePath] = useState(null);

  const { projectData } = useSelector((state) => state.project);

  const bgFilter = !!projectFilterStatus;

  const handleSaveNewProject = async (formData) => {
    const { projectName, projectStatus, projectProgress, filePath } = formData;

    if (!projectName || !projectStatus || !projectProgress) {
      toast.error('Please fill all required fields');
      return;
    }

    const payload = {
      filePath,
      projectName,
      projectStatus: projectStatus.value, 
      projectProgress: projectProgress.value,
    };

    try {
      const response = await apiCall('productivity/addproject', token, 'POST', payload);
      if (response?.message === 'Project created successfully') {
        toast.success('Project created');
        setShowOffcanvas(false);
        dispatch(fetchProjectData(token, per_page, page));
      } else {
        toast.error('Failed to create project.');
      }
    } catch (error) {
      toast.error('Error creating project.');
      console.error(error);
    }
  };

  const handleSaveEditProject = async (formData) => {
    const { projectName, projectStatus, projectProgress, filePath } = formData;

    if (!projectName || !projectStatus || !projectProgress) {
      toast.error('Please fill all required fields');
      return;
    }

    const payload = {
      filePath,
      projectName,
      projectStatus: projectStatus.value,
      projectProgress: projectProgress.value,
    };

    try {
      const response = await apiCall(`productivity/editProjectById/${editingProject.id}`, token, 'POST', payload);
      if (response) {
        toast.success('Project updated');
        setShowOffcanvas(false);
        dispatch(fetchProjectData(token, per_page, page));
      } else {
        toast.error('Failed to update project.');
      }
    } catch (error) {
      toast.error('Error updating project.');
      console.error(error);
    }
  };

  useEffect(() => {
    if (!token) {
      toast.error('You must be logged in to view this page');
      window.location.href = '/login';
      return;
    }
    let user = role === 'Admin' ? null : userId;
    dispatch(fetchProjectData(token, per_page, page, user, projectFilterStatus?.value));
  }, [dispatch, token, role, userId, per_page, page, projectFilterStatus]);

  useEffect(() => {
    if (projectData.pagination) {
      setPage(projectData.pagination.page);
      setTotal_page(projectData.pagination.total_pages);
    }
  }, [projectData.pagination]);

  const handleNewProjectClick = () => {
    setEditingProject(null);
    setOffcanvasTitle('New Project');
    setOffcanvasType('new');
    setShowOffcanvas(true);
  };

  const handleEditProject = (project) => {
    setEditingProject(project);
    setOffcanvasTitle('Edit Project');
    setOffcanvasType('edit');
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

  const handleCloseOffcanvas = () => setShowOffcanvas(false);
  const handleFilterClick = () => setShowFilterOffcanvas(true);
  const handleFilterClose = () => setShowFilterOffcanvas(false);
  const handlePreviousClick = () => setPage((p) => Math.max(1, p - 1));
  const handleNextClick = () => setPage((p) => (p < total_page ? p + 1 : p));
  const handlePageSizeChange = (size) => {
    setPer_page(size);
    setPage(1);
  };

  return (
    <Layout>
      <section className="section">
        <ProjectHeader
          onNewClick={handleNewProjectClick}
          onFilterClick={handleFilterClick}
          bgFilter={bgFilter}
          onExportClick={() => toast.info('Export logic here')}
          canAddProject={permissionData?.project?.canAddProject}
        />

        <ProjectTable
          data={projectData.data}
          pagination={projectData.pagination}
          onEdit={handleEditProject}
          onDelete={(project) => handleDeleteProject(project)}
          onPrevious={handlePreviousClick}
          onNext={handleNextClick}
          onPageSizeChange={handlePageSizeChange}
          editable={permissionData?.project?.canUpdateProject}
        />

        {showOffcanvas && (
          <ProjectOffcanvas
            title={offcanvasTitle}
            type={offcanvasType} // "new" or "edit"
            project={editingProject} // set this state when editing
            onClose={handleCloseOffcanvas}
            onSave={offcanvasType === 'new' ? handleSaveNewProject : handleSaveEditProject}
            setFile={setFile}
            file={file}
            setFilePath={setFilePath}
            filePath={filePath}
          />
        )}


        {showFilterOffcanvas && (
          <FilterOffCanvas
            title="Project Filter"
            content={
              <ProjectFilter
                value={projectFilterStatus}
                onChange={setProjectFilterStatus}
              />
            }
            onClose={handleFilterClose}
            handleClearAll={() => setProjectFilterStatus(null)}
          />
        )}
      </section>
    </Layout>
  );
}

export default Projects;
