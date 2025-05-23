// src/Pages/ProjectsDetails.js

// import core modules
import React, { useContext, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useSelector, useDispatch } from 'react-redux';
import { PermissionContext } from '../Context/PermissionContext';

// import require components
import { decryptId } from '../encryption';
import Layout from '../Components/Layout';
import { apiCall } from '../Components/API';
import OffCanvas from '../Components/OffCanvas';
import DataTable from '../Components/DataTable';

import { fetchProjectDetailsData, fetchAllUserData } from '../redux/actions/projectDetailsActions';
import SelectInput from '../Components/SelectInput';

function ProjectsDetails() {
  const { permissionData } = useContext(PermissionContext);
  const token = localStorage.getItem('token');
  // if (!token) {
  //   window.location.href = '/login';
  // }

  const role = localStorage.getItem('role');

  const { encryptedProjectID } = useParams();
  const [projectId, setProjectId] = useState();
  const [offcanvasType, setOffcanvasType] = useState(null);
  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null); // Store selected user ID
  const [selectedRole, setSelectedRole] = useState(""); // Store selected role


  const dispatch = useDispatch();
  const { projectDetailsData, allUserData } = useSelector(
    (state) => state.projectDetails
  );

  const currentDate = new Date().toISOString().split('T')[0];

  // Completed (includes 'Completed' and 'Done')
  const completed = projectDetailsData?.tasks?.filter(item =>
    item.status === 'Completed' || item.status === 'Done'
  );
  const competedCount = completed?.length;

  // Due today
  const dueToday = projectDetailsData?.tasks?.filter(item =>
    item.endDate === currentDate && !(item.status === 'Completed' || item.status === 'Done')
  );
  const dueTodayCount = dueToday?.length;

  // Overdue
  const overdue = projectDetailsData?.tasks?.filter(item =>
    item.endDate && item.endDate < currentDate && !(item.status === 'Completed' || item.status === 'Done')
  );
  const overdueCount = overdue?.length;

  // In-Progress
  const inProgress = projectDetailsData?.tasks?.filter(item =>
    item.status === 'In-Progress' &&
    (!item.endDate || (item.endDate !== currentDate && item.endDate >= currentDate))
  );
  const inProgressCount = inProgress?.length;

  // Backlog (example: you may want to track tasks with status = 'Backlog')
  const backlog = projectDetailsData?.tasks?.filter(item =>
    item.status === 'Backlog' &&
    (!item.endDate || (item.endDate !== currentDate && item.endDate >= currentDate))
  );
  const backlogCount = backlog?.length;


  // Fetch project data
  useEffect(() => {
    const fetchData = async () => {
      if (!encryptedProjectID) return;

      try {
        const projectId = decryptId(encryptedProjectID);
        setProjectId(projectId);

        if (projectId) {
          dispatch(fetchProjectDetailsData(token, projectId))
          // dispatch(fetchProjectTaskData(token, projectId))
          // dispatch(fetchProjectAssignUserData(token, projectId))
          dispatch(fetchAllUserData(token))
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchData();
  }, [encryptedProjectID, token, dispatch]);

  // handle assign button of offcanvas
  const handleAssignUser = async () => {
    if (!selectedUser || !selectedRole?.value) {
      toast.error('Both user and role are required.'); // Display an error message
      return;
    }

    const data = { userId: selectedUser, role: selectedRole?.value };

    try {
      const response = await apiCall(`productivity/assignUserToProject/${projectId}`, token, 'POST', data);
      if (response.message) {
        setSelectedRole(null)
        setSelectedUser(null)
        toast.success(response.message);
        dispatch(fetchProjectDetailsData(token, projectId))
      }
    } catch (error) {
      console.error('Error assigning user:', error);
      toast.error('An error occurred while assigning the user.');
    }
  };

  const columns = [
    { Header: 'User', accessor: 'full_name', sortable: true },
    { Header: 'Role', accessor: 'role', sortable: true },
  ];

  // handle delete button of datatable in offcanvas
  const handleDelete = async (projectAssignUserData) => {
    Swal.fire({
      title: "Are you sure?",
      text: `You want to delete this user assign"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, Delete it!"
    }).then(async (result) => {
      if (result.isConfirmed) {
        const data = { userID: projectAssignUserData.userID }
        try {
          const response = await apiCall(`productivity/removeUserfromProject/${projectAssignUserData.id}`, token, 'POST', data)
          toast.success(response.message);
          dispatch(fetchProjectDetailsData(token, projectId))
        } catch (error) {
          toast.error('Error occurred while deleting the role.');
          console.error(error);
        }
      }
    });
  }

  const userOption = allUserData?.map((user) => ({
    value: user.id,
    label: user.full_name
  }));

  // offcanvas content
  const offcanvasContent = {
    assignUser: (
      <>
        <div className="my-3" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', alignContent: 'center' }}>

          <div className="col-12 col-md-5 mb-2 mb-md-0 px-1">
            <div className="form-group">
              <SelectInput
                placeholder="Select User"
                value={userOption?.find(option => option.value === selectedUser) || null} // Find the selected user by ID
                onChange={(e) => setSelectedUser(e?.value || null)}  // Update selected user ID
                options={userOption}
              />
            </div>
          </div>

          <div className="col-12 col-md-5 mb-2 mb-md-0 px-1">
            <div className="form-group">
              <SelectInput
                placeholder="Select Role"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e)}
                options={[
                  { value: 'Project Admin', label: 'Project Admin' },
                  { value: 'Project Manager', label: 'Project Manager' },
                  { value: 'Developer', label: 'Developer' }
                ]}
              />
            </div>
          </div>

          <div className="col-12 col-md-2 m-0 p-0 form-group px-1">
            <button className="btn bgpre form-control m-0 p-0" style={{ backgroundColor: '#338db5', color: 'white', fontSize: '15px' }} type="button" onClick={handleAssignUser}>
              Assign
            </button>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={projectDetailsData.assignedUsers}
          deleteButton={(assignUserData) => assignUserData.role !== 'Project Admin'}
          onDelete={(assignUserData) => handleDelete(assignUserData)}
          footer={false}
        />
      </>
    ),
  };

  // Close offcanvas
  const handleCloseOffcanvas = () => {
    setShowOffcanvas(false);
  };

  // Show offcanvas
  const handleAssignUserClick = async () => {
    setOffcanvasType('assignUser');
    setShowOffcanvas(true);
  };

  const getStatusColorClass = (status) => {
    switch (status) {
      case 'Active':
        return 'status-active';    // green
      case 'Not Active':
        return 'status-not-active'; // red
      default:
        return 'status-default';   // gray or neutral
    }
  };

  const userNames = projectDetailsData?.assignedUsers?.map(user => user.full_name).join(', ');

  return (
    <>
      <Layout>
        <div className="row mb-3">
          <div className="col-lg-12">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', alignContent: 'center' }}>
              <h3 className='mb-0'></h3>
              <div>
                {role === 'Admin' &&
                  <button
                    type="button"
                    className="btn mt-0"
                    onClick={handleAssignUserClick}
                    style={{ color: '#338db5', border: '1px solid #338db5' }}
                  >
                    <i className="fa-solid fa-plus"></i>&nbsp;Assign User
                  </button>
                }
              </div>
            </div>
          </div>
        </div>

        <div className='row'>
          <div className="col-lg-12">
            <div className="dashboard-header">
              <div className="header-content">
                {/* Project Info */}
                <div className="project-info">
                  <div className="project-info">
                    <div className="project-logo" >
                      {projectDetailsData?.project?.imageURL ?
                        <img
                          src={projectDetailsData?.project?.imageURL}
                          alt={''}
                          style={{ width: '40px', height: '40px', borderRadius: '50%' }}
                        />
                        :
                        <i className="fa-solid fa-building" style={{ color: "#338db5" }}></i>
                      }
                    </div>
                    <div className="project-details">
                      <h1 className="one-line-text mb-0">{projectDetailsData?.project?.name}</h1>
                      <p className="one-line-text mb-0">{projectDetailsData?.project?.companyName}</p>
                    </div>
                  </div>
                </div>
                <div className={`status-badge`}>
                  <i
                    className={`far fa-dot-circle ${getStatusColorClass(projectDetailsData?.project?.status)}`}
                  ></i>
                  {projectDetailsData?.project?.status}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className='row'>
          <section className="section dashboard">
            <div className="col-lg-12">
              <div className="row">
                <div className="col-lg-3 p-1 col-md-6">
                  <div className="card  total-projects-card" style={{ borderLeft: 'none' }}>
                    <div className="card-body">
                      <div className="d-flex align-items-center">
                        <div className="card-icon d-flex align-items-center justify-content-center" style={{ backgroundColor: "#f3eefe" }}>
                          <i className="fas fa-tasks" style={{ color: "#8b5cf6" }}></i>
                        </div>
                        <div className="ps-3">
                          <h4 className="mt-4 mb-0 p-0"><strong>{projectDetailsData?.tasks?.length}</strong></h4>
                          <p className="mb-2 p-0" style={{ color: 'gray' }}>Total Tasks</p>
                        </div>
                      </div>
                      <div className="progress mt-2" style={{ height: "3px" }}>
                        <div className="progress-bar" role="progressbar" style={{ width: `${projectDetailsData?.tasks?.length}%`, backgroundColor: "#8b5cf6" }} ></div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-lg-3 p-1 col-md-6">
                  <div className="card  ongoing-tasks-card" style={{ borderLeft: 'none' }}>
                    <div className="card-body">
                      <div className="d-flex align-items-center">
                        <div className="card-icon d-flex align-items-center justify-content-center" style={{ backgroundColor: "#ebf2fe" }}>
                          <i className="fa-solid fa-clipboard-list" style={{ color: "#3b82f6" }}></i>
                        </div>
                        <div className="ps-3">
                          <h4 className="mt-4 mb-0 p-0"><strong>{backlogCount}</strong></h4>
                          <p className="mb-2 p-0" style={{ color: 'gray' }}>Backlog Tasks</p>
                        </div>
                      </div>
                      <div className="progress mt-2" style={{ height: "3px" }}>
                        <div className="progress-bar" role="progressbar" style={{ width: `${(backlogCount / projectDetailsData?.tasks?.length) * 100}%`, backgroundColor: "#3b82f6" }} ></div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-lg-3 p-1 col-md-6">
                  <div className="card  due-today-card" style={{ borderLeft: 'none' }}>
                    <div className="card-body">
                      <div className="d-flex align-items-center">
                        <div className="card-icon d-flex align-items-center justify-content-center mt-4 mb-2" style={{ backgroundColor: "#fef1e7" }}>
                          <i className="fas fa-spinner" style={{ color: "#f97316" }}></i>
                        </div>
                        <div className="ps-3">
                          <h4 className="mt-4 mb-0 p-0"><strong>
                            {inProgressCount}
                          </strong></h4>
                          <p className="mb-2 p-0" style={{ color: 'gray' }}>In Progress</p>
                        </div>
                      </div>
                      <div className="progress mt-2" style={{ height: "3px" }}>
                        <div className="progress-bar" role="progressbar" style={{ width: `${(inProgressCount / projectDetailsData?.tasks?.length) * 100}%`, backgroundColor: "#f97316" }} ></div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-lg-3 p-1 col-md-6">
                  <div className="card overdue-tasks-card" style={{ borderLeft: 'none' }}>
                    <div className="card-body">
                      <div className="d-flex align-items-center">
                        <div className="card-icon d-flex align-items-center justify-content-center" style={{ backgroundColor: "#fdecec" }}>
                          <i className="fa-solid fa-triangle-exclamation" style={{ color: "#ef4444" }}></i>
                        </div>
                        <div className="ps-3">
                          <h4 className="mt-4 mb-0 p-0"><strong>{overdueCount}</strong></h4>
                          <p className="mb-2 p-0" style={{ color: 'gray' }}>Overdue</p>
                        </div>
                      </div>
                      <div className="progress mt-2" style={{ height: "3px" }}>
                        <div className="progress-bar" role="progressbar" style={{
                          width: `${(overdueCount / projectDetailsData?.tasks?.length) * 100}%`,
                          backgroundColor: "#ef4444"
                        }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-lg-3 p-1 col-md-6">
                  <div className="card  overdue-tasks-card" style={{ borderLeft: 'none' }}>
                    <div className="card-body">
                      <div className="d-flex align-items-center">
                        <div className="card-icon d-flex align-items-center justify-content-center" style={{ backgroundColor: "#e8f9ef" }}>
                          <i className="fa-solid fa-calendar-day" style={{ color: "#22c55e" }}></i>
                        </div>
                        <div className="ps-3">
                          <h4 className="mt-4 mb-0 p-0"><strong>{dueTodayCount}</strong></h4>
                          <p className="mb-2 p-0" style={{ color: 'gray' }}>Due Today</p>
                        </div>
                      </div>
                      <div className="progress mt-2" style={{ height: "3px" }}>
                        <div className="progress-bar" role="progressbar" style={{ width: `${(dueTodayCount / projectDetailsData?.tasks?.length) * 100}%`, backgroundColor: "#22c55e" }} ></div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-lg-3 p-1 col-md-6">
                  <div className="card  overdue-tasks-card" style={{ borderLeft: 'none' }}>
                    <div className="card-body">
                      <div className="d-flex align-items-center">
                        <div className="card-icon d-flex align-items-center justify-content-center" style={{ backgroundColor: "#e7f8f6" }}>
                          <i className="fa-solid fa-circle-check" style={{ color: "#14b8a6" }}></i>
                        </div>
                        <div className="ps-3">
                          <h4 className="mt-4 mb-0 p-0"><strong>{competedCount}</strong></h4>
                          <p className="mb-2 p-0" style={{ color: 'gray' }}>Completed</p>
                        </div>
                      </div>
                      <div className="progress mt-2" style={{ height: "3px" }}>
                        <div className="progress-bar" role="progressbar" style={{ width: `${(competedCount / projectDetailsData?.tasks?.length) * 100}%`, backgroundColor: "#14b8a6" }} ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>


            </div>
          </section>
        </div>

        <div className='row'>
          <div className="col-lg-12">
            <div className="card m-1 p-0" >
              <div className='card-header'>
                <h4 className='p-2' style={{ color: 'black' }}><strong>Project Overview</strong></h4>
              </div>
              <div className="card-body m-0 p-0" >
                <div className="col-lg-12" >
                  <div className="card pt-2" style={{ backgroundColor: "#f8fafc" }}>
                    <div className="card-body" >
                      <div className="project-info">
                        <div className="project-logo" style={{ backgroundColor: "#ffffff", width: "50px", height: "50px" }}>
                          <i className="fa-solid fa-building fa-2xs" style={{ color: "#4f46e5" }}></i>
                        </div>
                        <div className="project-details" >
                          <p className="m-0 p-0" style={{ color: 'gray', fontSize: "smaller" }}>Company</p>
                          <p className="m-0 p-0" style={{ color: 'black' }}>JiyanTech</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-lg-12" >
                  <div className="card pt-2" style={{ backgroundColor: "#f8fafc" }}>
                    <div className="card-body" >
                      <div className="project-info">
                        <div className="project-logo" style={{ backgroundColor: "#ffffff", width: "50px", height: "50px" }}>
                          <i className="fa-solid fa-chart-line fa-2xs" style={{ color: "#4f46e5" }}></i>
                        </div>
                        <div className="project-details" >
                          <p className="m-0 p-0" style={{ color: 'gray', fontSize: "smaller" }}>Progress</p>
                          <p className="m-0 p-0" style={{ color: 'black' }}>In Progress</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-lg-12" >
                  <div className="card pt-2" style={{ backgroundColor: "#f8fafc" }}>
                    <div className="card-body" >
                      <div className="project-info">
                        <div className="project-logo" style={{ backgroundColor: "#ffffff", width: "50px", height: "50px" }}>
                          <i className="fa-solid fa-user-group fa-2xs" style={{ color: "#4f46e5" }}></i>
                        </div>
                        <div className="project-details">
                          <p className="m-0 p-0" style={{ color: 'gray', fontSize: "smaller" }}>Team Members</p>
                          {userNames?.length > 0 ? (
                            <p className="m-0 p-0" style={{ color: 'black' }}>
                              {userNames}
                            </p>
                          ) : (
                            <p className="m-0 p-0" style={{ color: 'black' }}>
                              No users assigned
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {showOffcanvas && (
          <OffCanvas
            title={offcanvasType === 'assignUser' ? 'Assign User' : ''}
            content={offcanvasContent['assignUser']}
            onClose={handleCloseOffcanvas}
            handleCloseOffcanvas={handleCloseOffcanvas}
            saveButton={false}
          />
        )}
      </Layout>
    </>
  );
}

export default ProjectsDetails;