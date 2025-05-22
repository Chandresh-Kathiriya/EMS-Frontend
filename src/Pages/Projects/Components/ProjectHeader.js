import React from 'react';

function ProjectHeader({ onNewClick, onFilterClick, onExportClick, bgFilter, canAddProject }) {
  return (
    <div className="row mb-3">
      <div className="d-flex justify-content-between align-items-center flex-wrap">
        <h3 className="mb-0">Projects</h3>
        <div>
          {canAddProject && (
            <button className="btn mx-1 mt-0" onClick={onNewClick} style={{ color: '#338db5', border: '1px solid #338db5' }}>
              <i className="fa-solid fa-circle-plus"></i>&nbsp;Project
            </button>
          )}
          <button className="btn mx-1 mt-0" onClick={onFilterClick} style={{ color: '#338db5', border: '1px solid #338db5', backgroundColor: bgFilter ? '#dbf4ff' : 'transparent' }}>
            <i className="fa-solid fa-bars"></i>&nbsp;Filters
          </button>
          <button className="btn mx-1 mt-0" onClick={onExportClick} style={{ color: '#338db5', border: '1px solid #338db5' }}>
            <i className="fa-solid fa-cloud-arrow-down"></i>&nbsp;Export
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProjectHeader;
