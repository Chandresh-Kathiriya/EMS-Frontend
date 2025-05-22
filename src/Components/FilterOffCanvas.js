import React from 'react';

const FilterOffCanvas = ({ title, content, onClose, handleClearAll, handleCloseOffcanvas }) => {

  return (
    <>
      <div className="filter-offcanvas">
        <div className='row'>
          <div className="col-md-12">
            <div className="FilterOffCanvas-header"
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', alignContent: 'center' }}>
              <h5 className='mb-0'>Filter {title}</h5>
              <div>
                <button
                  type="button"
                  className="btn bgpre py-1 px-2 mt-0"
                  onClick={handleClearAll}
                  style={{color: 'white', backgroundColor: '#338db5', fontSize: '14px'}}
                > 
                Clear All
                </button>
                <button
                  type="button"
                  onClick={handleCloseOffcanvas}
                  className="btn bgnone p-0 mt-0"
                  style={{color: 'gray'}}
                >
                  <i className="fas fa-xmark fa-xl px-2"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
        <hr className='mb-4' style={{width: '100%'}}/>
        <div className='row'>
          <div className="col-md-12">
            {content}
          </div>
        </div>
      </div>

      {/* Optional overlay when FilterOffCanvas is open */}
      <div
        className="FilterOffCanvas-overlay"
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
      </>
  );
};

export default FilterOffCanvas;