import React, {useState} from 'react';
import OffCanvas from '../../../Components/OffCanvas';
import ProjectForm from './ProjectForm';
import Swal from 'sweetalert2';
import { apiCall } from '../../../Components/API';
import { toast } from 'react-toastify';

function ProjectOffcanvas({ title, type, project, onClose, onSave }) {
  const [projectName, setProjectName] = React.useState(project?.name || '');
  const [projectStatus, setProjectStatus] = React.useState(project ? { value: project.status, label: project.status } : null);
  const [projectProgress, setProjectProgress] = React.useState(project ? { value: project.progress, label: project.progress } : null);
  const [filePath, setFilePath] = React.useState(project?.imageURL || '');
  const [formErrors, setFormErrors] = React.useState({});
  const [file, setFile] = useState(null);

  const handleUploadClick = async () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.jpg, .jpeg, .png';

    fileInput.onchange = async () => {
      const selectedFile = fileInput.files[0];
      if (!selectedFile) return;

      const fileExtension = selectedFile.name.split('.').pop().toLowerCase();
      if (!['jpg', 'jpeg', 'png'].includes(fileExtension)) {
        Swal.fire('Error!', 'Only JPG, JPEG, or PNG files are allowed.', 'error');
        return;
      }

      const formData = new FormData();
      formData.append('file', selectedFile);

      try {
        const token = localStorage.getItem('token');
        const response = await apiCall('productivity/upload?fileFor=project', token, 'POST', formData);

        if (response) {
          setFilePath(response.imageURL);
          setFile(response.imageName);
        } else {
          toast.error('File upload failed');
        }
      } catch (error) {
        const status = error?.response?.status;
        if (status === 401 || status === 403) {
          localStorage.removeItem('token');
          window.location.href = '/login';
        } else {
          toast.error('Error uploading file');
          console.error(error);
        }
      }
    };

    fileInput.click(); // Trigger the file dialog
  };


  const handleSave = () => {
    const errors = {
      projectName: !projectName,
      projectStatus: !projectStatus,
      projectProgress: !projectProgress,
    };
    setFormErrors(errors);

    if (Object.values(errors).includes(true)) return;

    onSave({
      projectName,
      projectStatus,
      projectProgress,
      filePath
    });
    onClose();
  };

  return (
    <OffCanvas
      title={title}
      onClose={onClose}
      handleCloseOffcanvas={onClose}
      handleSaveEdit={handleSave}
      content={
        <ProjectForm
          filePath={filePath}
          handleUploadClick={handleUploadClick}
          projectName={projectName}
          setProjectName={setProjectName}
          projectStatus={projectStatus}
          setProjectStatus={setProjectStatus}
          projectProgress={projectProgress}
          setProjectProgress={setProjectProgress}
          formErrors={formErrors}
        />
      }
    />
  );
}

export default ProjectOffcanvas;
