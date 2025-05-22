import React from 'react';
import { Modal } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

export const ModalComponent = ({ show, onHide, title, bodyContent, size = 'xl' }) => {
  return (
    <Modal
      show={show}
      onHide={onHide}
      size={size} 
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          <div className='fw-bold'>
          {title}
          </div>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ maxHeight: '80vh', overflowY: 'auto' }}>
        {bodyContent}
      </Modal.Body>
    </Modal>
  );
};
