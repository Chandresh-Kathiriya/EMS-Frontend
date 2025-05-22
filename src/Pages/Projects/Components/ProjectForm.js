import React from 'react';
import SelectInput from '../../../Components/SelectInput';

const statusOptions = [
  { value: 'Pending', label: 'Pending' },
  { value: 'In-Progress', label: 'In-Progress' },
  { value: 'Hold', label: 'Hold' },
  { value: 'Completed', label: 'Completed' },
  { value: 'Scraped', label: 'Scraped' },
];

const activityOptions = [
  { value: 'Active', label: 'Active' },
  { value: 'Not Active', label: 'Not Active' }
];

function ProjectForm({
  filePath,
  handleUploadClick,
  projectName,
  setProjectName,
  projectStatus,
  setProjectStatus,
  projectProgress,
  setProjectProgress,
  formErrors,
}) {
  return (
    <form>
      <div className="upload-box" onClick={handleUploadClick}>
        {!filePath ? <span>Upload Image</span> : <img className="upload-box" src={filePath} alt="Preview" />}
      </div>

      <div className="form-group py-2">
        <label>Project Name</label>
        <input
          type="text"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          className={`form-control ${formErrors?.projectName ? 'is-invalid' : ''}`}
          placeholder="Enter Project Name"
        />
        {formErrors?.projectName && <div className="invalid-feedback">Project name is required.</div>}
      </div>

      <div className="form-group py-2">
        <label>Project Status</label>
        <SelectInput
          placeholder="Select Option"
          value={projectStatus}
          onChange={setProjectStatus}
          options={activityOptions}
        />
      </div>

      <div className="form-group py-2">
        <label>Project Progress</label>
        <SelectInput
          placeholder="Select Option"
          value={projectProgress}
          onChange={setProjectProgress}
          options={statusOptions}
        />
      </div>
    </form>
  );
}

export default ProjectForm;
