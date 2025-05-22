// src/Pages/Tasks.js

// Import core modules
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useSelector, useDispatch } from 'react-redux';
import DatePicker from "react-datepicker";

// Import Components for page
import DataTable from '../Components/DataTable';
import Layout from '../Components/Layout';
import { apiCall } from '../Components/API';
import FilterOffCanvas from '../Components/FilterOffCanvas';
import SelectInput from '../Components/SelectInput';

import { fetchProjectData, fetchTaskData, fetchUser } from '../redux/actions/taskActions';

const initialData = {
  tasks: {},
  columns: {
    'Backlog': { id: 'Backlog', title: 'Backlog', taskIds: [] },
    'In-Progress': { id: 'In-Progress', title: 'In-Progress', taskIds: [] },
    'Done': { id: 'Done', title: 'Done', taskIds: [] },
    'Completed': { id: 'Completed', title: 'Completed', taskIds: [] },
    'Deployed': { id: 'Deployed', title: 'Deployed', taskIds: [] },
    'Due Today': { id: 'Due Today', title: 'Due Today', taskIds: [] },
    'Overdue': { id: 'Overdue', title: 'Overdue', taskIds: [] },
  },
  columnOrder: [],
};

function Tasks() {
  const navigate = useNavigate();

  const [showFilterOffcanvas, setShowFilterOffcanvas] = useState(false);
  const [taskCode, setTaskCode] = useState('');
  const [data, setData] = useState(initialData);
  const [per_page, setPer_page] = useState(10)
  const [page, setPage] = useState(1)
  const [total_page, setTotal_page] = useState('')

  const initialFilter = () => {
    try {
      const filter = localStorage.getItem('tasksFilter');
      return filter ? JSON.parse(filter) : {};
    } catch (error) {
      console.error('Error parsing tasksFilter:', error);
      return {};
    }
  };

  const filter = initialFilter();
  const bgFilter = Object.values(filter).some(value => value != null && value !== '');

  const [filters, setFilters] = useState(() => {
    const stored = initialFilter();
    return {
      assignee: stored.assignee || null,
      project: stored.project || null,
      task: stored.task || null,
      taskStatus: stored.taskStatus || null,
      dateFrom: stored.dateFrom || '',
      dateTo: stored.dateTo || '',
    }
  })

  // Check token is available In-localstorage
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const userId = localStorage.getItem('id');
  if (!token) {
    window.location.href = '/login';
  }

  let view = localStorage.getItem('view')
  if (view === '') {
    view = 'list'
  } else if (view !== 'list' && view !== 'board' && view !== 'kanban') {
    view = 'list'
  }

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

  const { taskData, allTaskData, userData, projectData } = useSelector(
    (state) => state.task
  );

  const dispatch = useDispatch();
  useEffect(() => {
    if (token) {  // Only fetch if we have a token 
      let assignUser;
      if (role === 'Admin') {
        assignUser = null;
      } else {
        assignUser = userId
      }
      const params = {
        per_page,
        page,
        project: filters.project,
        assignee: filters.assignee,
        task: filters.task,
        taskStatus: filters.taskStatus,
        dateFrom: filters.dateFrom,
        dateTo: filters.dateTo,
        user: assignUser
      }
      dispatch(fetchTaskData(token, params));
      dispatch(fetchUser(token));
      let user;
      if (role === 'Admin') {
        user = null;
      } else {
        user = userId
      }
      dispatch(fetchProjectData(token, user));
    }
  }, [token, per_page, page, dispatch, filters]);

  const handleNewTask = async (token) => {
    try {
      const response = await apiCall('productivity/getLastTaskCode', token, 'GET', null);
      if (response) {
        const numericPart = parseInt(response.slice(1), 10);
        const newNumericPart = numericPart + 1;
        const formattedNumericPart = newNumericPart.toString().padStart(5, '0');
        const newTaskID = `T${formattedNumericPart}`;

        navigate(`/productivity/tasks/${newTaskID}`); // Navigate to the task page
      }
    } catch (error) {
      console.error('Error fetching last task code:', error);
    }
  };

  const handleEditTask = async (task) => {
    setTaskCode(task.id)
    const response = await apiCall(`productivity/getTaskCodeById?id=${task.id || task}`, token, 'GET', null);
    try {
      navigate(`/productivity/tasks/${response}`); // Navigate to the task page
    } catch (error) {
      console.error('Error fetching last task code:', error);
    }
  };

  const handleDeleteUser = (task) => {
    Swal.fire({
      title: "Are you sure?",
      text: `You want to delete this Task?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!"
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await apiCall(`productivity/deleteTaskById/${task.id}`, token, 'POST', null)
          toast.success(response.message)
          window.location.reload();
        } catch (error) {
          console.log(error)
        }
      } else {
      }
    }
    );
  }

  const columns = [
    { Header: 'Code', accessor: 'code', sortable: true, },
    { Header: 'Task', accessor: 'name', sortable: true },
    { Header: 'Start Date', accessor: 'startDate', sortable: true },
    { Header: 'End Date', accessor: 'endDate', sortable: true },
    { Header: 'Project Name', selector: 'projectName', sortable: true, },
    { Header: 'Total Time', accessor: 'totalTaskTime', sortable: true },
    { Header: 'Created By', accessor: 'createdByName', sortable: true },
    { Header: 'Status', accessor: 'status', sortable: true },
    { Header: 'Assignee', accessor: 'assigneeName', sortable: true },
  ];

  const handleCloseOffcanvas = () => {
    setShowFilterOffcanvas(false);
  };

  const handleDateChange = (date, field) => {
    if (field === 'dateFrom') {
      const updatedFilters = {
        ...filters,
        dateFrom: date,
      };

      // Only clear To date if it exists and is before the new From date
      if (filters.dateTo && date && new Date(date) > new Date(filters.dateTo)) {
        updatedFilters.dateTo = null;
      }

      setFilters(updatedFilters);
    } else if (field === 'dateTo') {
      setFilters({
        ...filters,
        dateTo: date,
      });
    }
  };

  const handleListClick = () => {
    localStorage.setItem('view', 'list')
    window.location.reload()
  }

  const handleBoardClick = () => {
    localStorage.setItem('view', 'board')
    window.location.reload()
  }

  const handleKanbanClick = () => {
    localStorage.setItem('view', 'kanban')
    window.location.reload()
  }

  const handleClearAll = () => {
    setFilters({
      assignee: null,
      project: null,
      task: null,
      taskStatus: null,
      dateFrom: '',
      dateTo: ''
    })
  };

  useEffect(() => {
    if (taskData?.pagination) {
      setPage(taskData?.pagination.page);
      setPer_page(taskData?.pagination.per_page);
      setTotal_page(taskData?.pagination.total_pages);
    }
  }, [taskData?.pagination]);

  useEffect(() => {
    if (taskData?.data?.length > 0) {
      fetchDataForBoard(taskData);
    }
  }, [taskData]);

  useEffect(() => {
    localStorage.setItem('tasksFilter', JSON.stringify(filters));
  }, [filters]);

  const fetchDataForBoard = async () => {

    try {
      const tasks = (taskData.data);

      const taskMap = {};
      const columns = {
        'Backlog': { id: 'Backlog', title: 'Backlog', taskIds: [] },
        'In-Progress': { id: 'In-Progress', title: 'In-Progress', taskIds: [] },
        'Done': { id: 'Done', title: 'Done', taskIds: [] },
        'Completed': { id: 'Completed', title: 'Completed', taskIds: [] },
        'Deployed': { id: 'Deployed', title: 'Deployed', taskIds: [] },
      };

      // Conditionally add "Due Today" and "Overdue" columns only for Kanban view
      if (view === 'kanban') {
        columns['Due Today'] = { id: 'Due Today', title: 'Due Today', taskIds: [] };
        columns['Overdue'] = { id: 'Overdue', title: 'Overdue', taskIds: [] };
      }

      const columnOrder = [];
      if (view === 'board') {
        columnOrder.push('Backlog', 'In-Progress', 'Done', 'Completed', 'Deployed'); // Add new columns to the order
      } else if (view === 'kanban') {
        columnOrder.push('Backlog', 'In-Progress', 'Due Today', 'Overdue', 'Completed');
      }

      tasks.forEach((task) => {
        const taskId = `${task.id}`;
        taskMap[taskId] = {
          id: taskId,
          content: task.name,
          code: task.code,
          startDate: task.startDate,
          endDate: task.endDate,
          projectName: task.projectName,
          status: task.status,
        };

        // Categorize tasks into columns based on status
        if (view === 'board') {
          if (task.status === 'Done') {
            columns['Done'].taskIds.push(taskId);
          } else if (task.status === 'Deployed') {
            columns['Deployed'].taskIds.push(taskId);
          } else if (task.status === 'Backlog') {
            columns['Backlog'].taskIds.push(taskId);
          } else if (task.status === 'In-Progress') {
            columns['In-Progress'].taskIds.push(taskId);
          } else if (task.status === 'Completed') {
            columns['Completed'].taskIds.push(taskId);
          }
        } else if (view === 'kanban') {
          if (task.status === 'Completed' || task.status === 'Done' || task.status === 'Deployed') {
            columns['Completed'].taskIds.push(taskId);
          } else if (task.status === 'Backlog' || task.status === 'In-Progress') {
            const today = new Date().toISOString().split('T')[0];
            if (task.endDate === today) {
              columns['Due Today'].taskIds.push(taskId);
            } else if (task.endDate < today && task.status !== 'Completed' && task.status !== 'Deployed') {
              columns['Overdue'].taskIds.push(taskId);
            } else if (!(task.endDate)) {
              columns['In-Progress'].taskIds.push(taskId);
            } else if (task.endDate > today) {
              if (task.status === 'Backlog') {
                columns['Backlog'].taskIds.push(taskId);
              } else if (task.status === 'In-Progress') {
                columns['In-Progress'].taskIds.push(taskId);
              }
            }
          }
        }
      });

      setData({
        tasks: taskMap,
        columns: columns,
        columnOrder: columnOrder,
      });
    } catch (error) {
      console.error('Error fetching data:' + error);
    }
  };

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    // If there's no destination, do nothing
    if (!destination) return;

    // If the task is dropped In-the same place, do nothing
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const startColumn = data.columns[source.droppableId];
    const finishColumn = data.columns[destination.droppableId];

    let updatedColumns;

    // Handle tasks withIn-the same column
    if (startColumn === finishColumn) {
      const newTaskIds = Array.from(startColumn.taskIds);
      newTaskIds.splice(source.index, 1);
      newTaskIds.splice(destination.index, 0, draggableId);

      const newColumn = {
        ...startColumn,
        taskIds: newTaskIds,
      };

      updatedColumns = {
        ...data.columns,
        [newColumn.id]: newColumn,
      };

      // Update the status In-the database
      try {
        const response = await apiCall(`productivity/updateTaskStatus/${draggableId}`, token, 'POST', { status: finishColumn.id });
      } catch (error) {
        console.error('Error updating task status:', error);
      }

    } else {
      // Handle moving the task to a different column
      const startTaskIds = Array.from(startColumn.taskIds);
      startTaskIds.splice(source.index, 1);
      const newStartColumn = {
        ...startColumn,
        taskIds: startTaskIds,
      };

      const finishTaskIds = Array.from(finishColumn.taskIds);
      finishTaskIds.splice(destination.index, 0, draggableId);
      const newFinishColumn = {
        ...finishColumn,
        taskIds: finishTaskIds,
      };

      updatedColumns = {
        ...data.columns,
        [newStartColumn.id]: newStartColumn,
        [newFinishColumn.id]: newFinishColumn,
      };

      if (finishColumn.id === 'Due Today') {
        try {
          const response = await apiCall(`productivity/updateTaskStatus/${draggableId}`, token, 'POST', { status: 'In-Progress', due: 'today' });
        } catch (error) {
          console.error('Error updating task status:', error);
        }
      } else if (finishColumn.id === 'Overdue') {
        try {
          const response = await apiCall(`productivity/updateTaskStatus/${draggableId}`, token, 'POST', { status: 'In-Progress', due: 'over' });
        } catch (error) {
          console.error('Error updating task status:', error);
        }
      } else {
        // Update the status In-the database
        try {
          const response = await apiCall(`productivity/updateTaskStatus/${draggableId}`, token, 'POST', { status: finishColumn.id });
        } catch (error) {
          console.error('Error updating task status:', error);
        }
      }
    }

    // Update the state with the new column data
    setData({
      ...data,
      columns: updatedColumns,
    });
  };

  const columnStyles = {
    'Backlog': { backgroundColor: '#f4f4f4', borderTop: 'solid #fd504e 5px', taskBorderColor: '#fd504e' },
    'In-Progress': { backgroundColor: '#f4f4f4', borderTop: 'solid #fa8b3e 5px', taskBorderColor: '#fa8b3e' },
    'Completed': { backgroundColor: '#f4f4f4', borderTop: 'solid #45de67 5px', taskBorderColor: '#45de67' },
    ...(view === 'board' && {
      'Done': { backgroundColor: '#f4f4f4', borderTop: 'solid #919687 5px', taskBorderColor: '#919687' },
      'Deployed': { backgroundColor: '#f4f4f4', borderTop: 'solid #82d8ef 5px', taskBorderColor: '#82d8ef' },
    }),
    ...(view === 'kanban' && {
      'Due Today': { backgroundColor: '#f4f4f4', borderTop: 'solid #919687 5px', taskBorderColor: '#919687' },
      'Overdue': { backgroundColor: '#f4f4f4', borderTop: 'solid #d92522 5px', taskBorderColor: '#d92522' },
    }),
  };

  const getSelectedAssignee = () => {
    const user = userData?.data?.find(u => u.id === filters.assignee);
    return user ? { value: user.id, label: `${user.empCode} - ${user.full_name} ` } : null;
  };

  const getSelectedProject = () => {
    const user = projectData?.data?.find(u => u.id === filters.project);
    return user ? { value: user.id, label: user.name } : null;
  };

  const getSelectedTask = () => {
    const user = allTaskData?.data?.find(u => u.code === filters.task);
    return user ? { value: user.code, label: user.code } : null;
  };

  return (
    <>
      <Layout>
        <section className="section">
          <div className="row mb-3">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', alignContent: 'center' }}>
              <h3 className='mb-0'>Tasks List</h3>
              <div>
                <button
                  type="button"
                  className="btn mx-1 mt-0"
                  onClick={() => handleNewTask(token)} // Open add task modal
                  style={{ color: '#338db5', border: '1px solid #338db5' }}
                >
                  <i className="fa-solid fa-plus"></i>&nbsp;
                  Task
                </button>
                <button
                  type="button"
                  className="btn mx-1 mt-0"
                  onClick={() => { setShowFilterOffcanvas(true) }} // Pass userToEdit as the parameter
                  style={{
                    color: '#338db5',
                    border: '1px solid #338db5',
                    backgroundColor: bgFilter ? '#dbf4ff' : 'transparent'
                  }}
                >
                  <i className="fa-solid fa-bars"></i>&nbsp;
                  Filters
                </button>
                <button
                  type="button"
                  className="btn mx-1 mt-0"
                  onClick={handleListClick}
                  style={{
                    color: '#338db5',
                    border: '1px solid #338db5',
                    backgroundColor: view === 'list' ? '#dbf4ff' : 'transparent'
                  }}
                >
                  <i className="fa-solid fa-list"></i>
                </button>
                <button
                  type="button"
                  className="btn mx-1 mt-0"
                  onClick={handleBoardClick}
                  style={{
                    color: '#338db5',
                    border: '1px solid #338db5',
                    backgroundColor: view === 'board' ? '#dbf4ff' : 'transparent'
                  }}
                >
                  <i className="fa-solid fa-clipboard-list"></i>
                </button>
                <button
                  type="button"
                  className="btn mx-1 mt-0"
                  onClick={handleKanbanClick}
                  style={{
                    color: '#338db5',
                    border: '1px solid #338db5',
                    backgroundColor: view === 'kanban' ? '#dbf4ff' : 'transparent'
                  }}
                >
                  <i className="fa-solid fa-square-poll-vertical"></i>
                </button>
              </div>
            </div>
          </div>

          {view === 'list' &&
            <div className='row'>
              <div className="col-lg-12">
                <DataTable
                  columns={columns}
                  data={taskData?.data}
                  pagination={taskData?.pagination}
                  onClickPrevious={handlePreviousClick}
                  onClickNext={handleNextClick}
                  onPageSizeChange={handlePageSizeChange}
                  onEdit={handleEditTask}
                  editButton={true}
                  onDelete={handleDeleteUser}
                  deleteButton={true}

                  footer={true}
                />
              </div>
            </div>
          }

          {(view === 'board' || view === 'kanban') &&
            <>
              <DragDropContext onDragEnd={onDragEnd} >
                <div className="row" style={{ display: 'flex', }} >
                  <div className='px-2' style={{ display: 'ruby', overflowX: 'auto', whiteSpace: 'nowrap', alignItems: 'flex-start' }}>
                    {data.columnOrder.map((columnId) => {
                      const column = data.columns[columnId];
                      const tasks = column.taskIds.map((taskId) => data.tasks[taskId]);

                      return (
                        <Droppable key={column.id} droppableId={column.id}>
                          {(provided) => (
                            <div
                              className='taskdnd'
                              {...provided.droppableProps}
                              ref={provided.innerRef}
                              style={{
                                margin: '10px',
                                borderRadius: '8px',
                                width: '300px',
                                display: 'flex',
                                flexDirection: 'column',
                                minHeight: '270px',
                                maxHeight: '500px',
                                height: '100%',
                                ...columnStyles[column.id],
                              }}
                            >
                              <div className='row' style={{ position: 'sticky', top: 0, zIndex: 2 }}>
                                <div className="col-lg-12">
                                  <div style={{ backgroundColor: '#fff' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                      <h5 className='mb-0' style={{ padding: '16px' }}>{column.title}</h5>
                                      <span style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        backgroundColor: '#e2e8f0',
                                        minWidth: '24px',
                                        height: '24px',
                                        borderRadius: '999px',
                                        padding: '0px 8px'
                                      }}>
                                        {tasks.length}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <hr className='mt-0 mb-2' />
                              <div style={{
                                overflowY: 'auto',
                                flexGrow: 1,
                                maxHeight: '100%',
                              }}>
                                {tasks.map((task, index) => (
                                  <Draggable key={task.id} draggableId={task.id} index={index}

                                  >
                                    {(provided) => (
                                      <div
                                        className="card d-flex task-card justify-content-between align-items-center mt-0"
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        style={{
                                          borderLeft: `solid ${columnStyles[column.id].taskBorderColor} 5px`,
                                          ...provided.draggableProps.style,
                                        }}

                                        onClick={() => handleEditTask(task.id)}
                                      >
                                        <div className="p-3" style={{ width: '100%', cursor: 'pointer', justifyContent: 'space-between' }}>
                                          <div className="d-flex justify-content-between">
                                            <span style={{ color: 'gray' }}>#{task.code}</span >
                                            {task.projectName &&
                                              <span className="px-2 py-1" style={{ fontSize: '14px', fontWeight: 'bold', color: '#3b82f6', backgroundColor: '#eff6ff' }}>
                                                {task.projectName}
                                              </span>
                                            }
                                          </div>
                                          <p style={{
                                            wordWrap: 'break-word',
                                            whiteSpace: 'normal',
                                            marginBottom: 0,
                                          }}>{task.content}</p>

                                        </div>
                                      </div>
                                    )}
                                  </Draggable>
                                ))}
                                {provided.placeholder}
                              </div>
                            </div>
                          )}
                        </Droppable>
                      );
                    })}
                  </div>
                </div>
              </DragDropContext>
            </>
          }

        </section>
      </Layout >

      {/* Offcanvas Component for filters */}
      {showFilterOffcanvas && (
        <FilterOffCanvas
          title='Task'
          content={
            <>
              {role === 'Admin' &&
                <div className="form-group">
                  <label>Assignee</label>
                  <SelectInput
                    placeholder="Select Assignee"
                    value={getSelectedAssignee()}
                    onChange={(e) =>
                      setFilters({ ...filters, assignee: e?.value }) // Update status in the filter state
                    }
                    options={userData?.data?.map((assignee) => ({
                      value: assignee.id,
                      label: `${assignee.empCode} - ${assignee.full_name}`
                    }))}
                  />
                </div>
              }

              <div className="form-group py-2">
                <label>Project</label>
                <SelectInput
                  placeholder="Select Project"
                  value={getSelectedProject()}
                  onChange={(e) =>
                    setFilters({ ...filters, project: e?.value }) // Update status in the filter state
                  }
                  options={projectData?.data?.map((project) => ({
                    value: project.id,
                    label: project.name
                  }))}
                />
              </div>

              <div className="form-group py-2">
                <label>Task Code</label>
                <SelectInput
                  placeholder="Select Task Code"
                  value={getSelectedTask()}
                  onChange={(e) =>
                    setFilters({ ...filters, task: e?.value }) // Update status in the filter state
                  }
                  options={allTaskData?.data?.map((task) => ({
                    value: task.code,
                    label: task.code
                  }))}
                />
              </div>

              <div className="form-group py-2 mx-1">
                <div className="col-lg-12 d-flex">
                  <div className="col-md-6">
                    <label>From</label>
                    <div className='form-control'>
                      <DatePicker
                        className='reactdatePicker'
                        selected={filters.dateFrom ? new Date(filters.dateFrom) : null}
                        onChange={(date) => handleDateChange(date, 'dateFrom')}
                        dateFormat="dd/MM/yyyy"
                        placeholderText="DD/MM/YYYY"
                        isClearable
                        clearButtonClassName='m-0 p-0 mx-5'
                      />
                    </div>
                  </div>
                  <div className="col-md-6 mx-1">
                    <label>To</label>
                    <div className='form-control '>
                      <DatePicker
                        className='reactdatePicker'
                        selected={filters.dateTo ? new Date(filters.dateTo) : null}
                        onChange={(date) => handleDateChange(date, 'dateTo')}
                        dateFormat="dd/MM/yyyy"
                        placeholderText="DD/MM/YYYY"
                        isClearable
                        clearButtonClassName='m-0 p-0 mx-5'
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="form-group py-2">
                <label>Task Status</label>
                <SelectInput
                  placeholder={'Select Option'}
                  value={filters.taskStatus ? { value: filters.taskStatus, label: filters.taskStatus } : null}
                  onChange={(e) =>
                    setFilters({ ...filters, taskStatus: e?.value }) // Update status in the filter state
                  }
                  options={[{ value: 'Pending', label: 'Pending' },
                  { value: 'In-Progress', label: 'In-Progress' },
                  { value: 'Hold', label: 'Hold' },
                  { value: 'Completed', label: 'Completed' },
                  { value: 'Scraped', label: 'Scraped' },
                  ]}
                />
              </div>
            </>
          }
          onClose={handleCloseOffcanvas}
          handleCloseOffcanvas={handleCloseOffcanvas}
          handleClearAll={handleClearAll}
        />
      )}
    </>
  );
}

export default Tasks;