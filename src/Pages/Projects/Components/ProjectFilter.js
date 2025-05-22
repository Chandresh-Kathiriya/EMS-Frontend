import React from 'react';
import SelectInput from '../../../Components/SelectInput';

const statusOptions = [
  { value: 'Pending', label: 'Pending' },
  { value: 'In-Progress', label: 'In-Progress' },
  { value: 'Hold', label: 'Hold' },
  { value: 'Completed', label: 'Completed' },
  { value: 'Scraped', label: 'Scraped' },
];

function ProjectFilter({ value, onChange }) {
  return (
    <div className="form-group">
      <label>Project Status</label>
      <SelectInput
        placeholder="Select Status"
        value={value}
        onChange={onChange}
        options={statusOptions}
      />
    </div>
  );
}

export default ProjectFilter;
