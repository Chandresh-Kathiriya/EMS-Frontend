import React from 'react';

const OffCanvas = ({ title, content, saveButton = true, cancelButton = true, onClose, handleSaveEdit, handleCloseOffcanvas }) => {


  return (
    <div>
      {/* Offcanvas container */}
      <div
        className="offcanvas-container"
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          // maxWidth: '1100px',
          width: 'auto',
          height: '100%',
          backgroundColor: '#EFF0F1',
          transition: 'right 0.3s ease',
          zIndex: 1000,
          padding: '20px',
          overflowY: 'auto',
        }}
      >
        <div className="offcanvas-header"
          style={{ display: 'flex', justifyContent: 'space-between' }}>
          <h4 className='mb-0'>{title}</h4>
          <div>
            {saveButton &&
              <button
                type="button"
                className="btn bgnone mx-1 mt-0"
                onClick={handleSaveEdit} // Handle save
                style={{ color: '#338db5', border: '1px solid #338db5' }}
              >
                <i className="fa-regular fa-floppy-disk pe-1"></i> Save
              </button>
            }
            {cancelButton &&
              <button
                type="button"
                onClick={handleCloseOffcanvas}
                className="btn bgnone mt-0"
                style={{ color: '#fd6f6f', border: '1px solid #fd6f6f' }}
              >
                <i className="fas fa-circle-xmark pe-1"></i>Cancel
              </button>
            }
          </div>
        </div>
        <div style={{ margin: '0 -20px' }}>
          <hr className='mb-1' />
        </div>
        <div>{content}</div>
      </div>

      {/* Optional overlay when offcanvas is open */}
      <div
        className="offcanvas-overlay"
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 999,
        }}
      />
    </div>
  );
};

export default OffCanvas;