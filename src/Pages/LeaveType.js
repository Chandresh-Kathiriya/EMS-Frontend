// src/Pages/LeaveType

// import core module
import React, { useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { useSelector, useDispatch } from 'react-redux';
import { PermissionContext } from '../Context/PermissionContext';

// import require components
import DataTable from '../Components/DataTable';
import { apiCall } from '../Components/API';
import Layout from '../Components/Layout';
import OffCanvas from '../Components/OffCanvas';

import { fetchLeaveTypeData } from '../redux/actions/leaveTypeActions';

function LeaveType() {
  const { permissionData } = useContext(PermissionContext);
  const token = localStorage.getItem('token');  // Get token from local storage
  // if (!token) {
  //   window.location.href = '/login'; // Redirect if no token
  // }

  const [selectedLeaveType, setSelectedLeaveType] = useState(null); // LeaveType selected for editing  
  const [showOffcanvas, setShowOffcanvas] = useState(false); // To show/hide offcanvas
  const [leaveType, setLeaveType] = useState([]); // Store leave types fetched from API
  const [offcanvasType, setOffcanvasType] = useState(null); // For determining offcanvas content type
  const [role, setRole] = useState(null); // User role
  // const [params, setParams] = useState({});
  const [per_page, setPer_page] = useState(10)
  const [page, setPage] = useState(1)
  const [total_page, setTotal_page] = useState('')

  useEffect(() => {
    const role = localStorage.getItem('role');
    setRole(role);
  }, []);

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

  const dispatch = useDispatch();
  const { leaveTypeData } = useSelector(
    (state) => state.leaveType
  );

  useEffect(() => {
    if (token) {  // Only fetch if we have a token 
      dispatch(fetchLeaveTypeData(token, per_page, page));
    }
  }, [token, per_page, page, dispatch]);

  useEffect(() => {
    if (leaveTypeData.pagination) {
      setPage(leaveTypeData.pagination.page);
      setPer_page(leaveTypeData.pagination.per_page);
      setTotal_page(leaveTypeData.pagination.total_pages);
    }
  }, [leaveTypeData.pagination]);

  // Offcanvas content for 'edit' and 'new'
  const offcanvasContent = {
    edit: (
      <>
        <form id="leaveTypeForm">
          <div className="form-group py-2 mt-3">
            <label htmlFor="leaveTypeName">Name</label>
            <input className="form-control" type="text" id="leaveTypeName" defaultValue={selectedLeaveType?.name} required />
          </div>
          <div className="form-group py-2 ">
            <label htmlFor="leaveTypeCode">Code</label>
            <input className="form-control" type="text" id="leaveTypeCode" defaultValue={selectedLeaveType?.code} required />
          </div>
        </form>
      </>
    ),
    newLeaveType: (
      <>
        <form id="leaveTypeForm">
          <div className="form-group py-2 mt-3">
            <label htmlFor="leaveTypeName">Name</label>
            <input className="form-control" type="text" id="leaveTypeName" placeholder='Leave Type Name' required />
          </div>
          <div className="form-group py-2 ">
            <label htmlFor="leaveTypeCode">Code</label>
            <input className="form-control" type="text" id="leaveTypeCode" placeholder='Leave Type Code' required />
          </div>
        </form>
      </>
    ),
  };

  // Handle New LeaveType (open new leave offcanvas)
  const handleNewLeaveType = () => {
    setOffcanvasType('newLeaveType');
    setShowOffcanvas(true);
  };

  // Handle save after edit
  const handleSaveEdit = async () => {
    const name = document.getElementById('leaveTypeName').value;
    const code = document.getElementById('leaveTypeCode').value;

    if (!name || !code) {
      toast.error('Please fill in all fields');
      return;
    }

    const updatedLeaveType = { id: selectedLeaveType.id, name, code };

    try {
      const response = await apiCall('leave/updateLeaveType', token, 'POST', updatedLeaveType);
      if (response) {
        toast.success('Leave Type updated successfully!');
        setShowOffcanvas(false);
        // getLeaveTypeData(); // Refresh the list after saving
      }
    } catch (error) {
      toast.error('Error updating leave type');
    }
  };

  // Handle add new leave
  const handleNew = async () => {
    const name = document.getElementById('leaveTypeName').value;
    const code = document.getElementById('leaveTypeCode').value;

    if (!name || !code) {
      toast.error('Please fill in all fields');
      return;
    }

    const updatedLeaveType = { name, code };

    try {
      const response = await apiCall('leave/createLeaveType', token, 'POST', updatedLeaveType);
      if (response) {
        toast.success(response.message);
        setShowOffcanvas(false);
        dispatch(fetchLeaveTypeData(token, per_page, page))
        // getLeaveTypeData(); // Refresh the list after saving
      }
    } catch (error) {
      toast.error('Error updating leave type');
    }
  }

  // Handle delete button click
  const handleDelete = async (leaveType) => {
    Swal.fire({
      title: "Are you sure?",
      text: `You want to delete this Leave Type "${leaveType.name}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!"
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await apiCall('leave/deleteLeaveType', token, 'POST', { id: leaveType.id });
          toast.success(`Leave Type deleted successfully!`);
          dispatch(fetchLeaveTypeData(token, per_page, page))
          // getLeaveTypeData(); // Refresh list after deletion
        } catch (error) {
          toast.error('Failed to delete leave type');
        }
      }
    });
  };


  // Handle edit button click
  const handleEdit = (leaveType) => {
    setSelectedLeaveType(leaveType);
    setOffcanvasType('edit');
    setShowOffcanvas(true);
  };

  // Close offcanvas
  const handleCloseOffcanvas = () => {
    setShowOffcanvas(false);
  };

  // Define table columns
  const columns = [
    { Header: 'Name', accessor: 'name', sortable: true },
    { Header: 'Code', accessor: 'leaveCode', sortable: true },
  ];

  return (
    <Layout>
      <section className="section">

        <div className="row mb-3">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', alignContent: 'center' }}>
            <h3>Leave Type</h3>
            {permissionData?.leaveType?.canUpdateLeaveType &&
              <div>
                <button
                  type="button"
                  className="btn mx-1 mt-0"
                  onClick={handleNewLeaveType} // Open new leave offcanvas
                  style={{ color: '#338db5', border: '1px solid #338db5' }}
                >
                  <i className="fa-solid fa-circle-plus"></i>&nbsp;Leave Type
                </button>
              </div>
            }
          </div>
        </div>

        <div className='row'>
          <div className="col-lg-12">
            <DataTable
              columns={columns}
              data={leaveTypeData.data}
              pagination={leaveTypeData.pagination}
              onClickPrevious={handlePreviousClick}
              onClickNext={handleNextClick}
              onPageSizeChange={handlePageSizeChange}
              onEdit={handleEdit}
              editButton={permissionData?.leaveType?.canUpdateLeaveType} // Enable edit button
              deleteButton={permissionData?.leaveType?.canDeleteLeaveType}
              onDelete={handleDelete}
              footer={true}
            />
          </div>
        </div>

      </section>

      {/* Offcanvas Component */}
      {showOffcanvas && (
        <OffCanvas
          title={
            offcanvasType === 'edit'
              ? 'Update Leave Type'
              : offcanvasType === 'newLeaveType'
                ? 'Create Leave Type'
                : ''
          }
          content={offcanvasContent[offcanvasType]} // Dynamic content based on the offcanvas type
          onClose={handleCloseOffcanvas}
          handleSaveEdit={offcanvasType === 'edit'
            ? handleSaveEdit
            : offcanvasType === 'newLeaveType'
              ? handleNew
              : ''}
          handleCloseOffcanvas={handleCloseOffcanvas}
        />
      )}
    </Layout>
  );
}

export default LeaveType;