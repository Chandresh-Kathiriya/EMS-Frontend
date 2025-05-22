// src/Pages/AddTasks.js

// import core modules
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import Swal from 'sweetalert2';
import PDFView from '../Components/PDFView';

// import require components
import Layout from '../Components/Layout';
import { apiCall } from '../Components/API';
import SelectInput from '../Components/SelectInput'
import { ModalComponent } from '../Components/Model'

import { fetchProjectData, fetchAssigneeData, fetchTaskAllData, fetchTaskData, fetchAllUser } from '../redux/actions/addTaskAction';

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

function AddTask() {
  const date = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = '/login';
  }

  const userName = localStorage.getItem('userName')
  const role = localStorage.getItem('role')
  const userId = localStorage.getItem('id')

  const { taskId } = useParams(); // Getting taskId from URL params
  const [fileName, setFileName] = useState('');
  const [commentFiles, setCommentFiles] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [commentFileURLData, setCommentFileURLData] = useState([]);
  const [attechmentFiles, setAttechmentFiles] = useState(null);
  const [attechmentFileURLData, setAttechmentFileURLData] = useState(null);
  const [userData, setUserData] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [selectedAssignee, setSelectedAssignee] = useState(null);
  const [taskCode, setTaskCode] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [estimatedTime, setEstimatedTime] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [isEditingTaskTitle, setIsEditingTaskTitle] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [isEditingTaskTODO, setIsEditingTaskTODO] = useState(false);
  const [isEditingTaskStartTime, setIsEditingTaskStartTime] = useState(false)
  const [createdBy, setCreatedBy] = useState('');
  const [createdAt, setCreatedAt] = useState('');
  const [todos, setTodos] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isFilePreviewVisible, setIsFilePreviewVisible] = useState(false);
  const [isTaskTimePreviewVisible, setIsTaskTimePreviewVisible] = useState(false);
  const [isUserPreviewVisible, setIsUserPreviewVisible] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [modalShow, setModalShow] = useState(false);
  const [isReload, satIsReload] = useState(false)
  const [selectedUserOption, setSelectedUserOption] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const handleToast = (message) => {
    toast.success(message);
  };

  const handlePenClickTitle = () => {
    setIsEditingTaskTitle(true);
  };

  const handleCheckClickTitle = async () => {
    setIsEditingTaskTitle(false);
    const title = {
      name: taskTitle,
      code: taskCode
    }

    const response = await apiCall('productivity/saveTask', token, 'POST', title);

    toast.success('Task Updated Successfully!!')
  };

  const handlePenClickDescription = () => {
    setIsEditingDescription(true);
  };

  const handleCheckClickDescription = async () => {
    setIsEditingDescription(false);
    const description = {
      description: taskDescription,
      code: taskCode
    }

    const response = await apiCall('productivity/saveTask', token, 'POST', description);
  };

  const handlePenClickTaskTODO = () => {
    setIsEditingTaskTODO(true);
  }

  const handleCheckClickTaskTODO = () => {
    setIsEditingTaskTODO(false);
  }

  const handleFileChangeTask = async (e) => {
    const selectedFiles = e.target.files;

    let uploadedFilesURL = attechmentFileURLData || [];
    // Set the attachment files state
    await setAttechmentFiles(selectedFiles);

    // Iterate over the selected files
    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];

      try {
        // Save the file to storage and get the public URL
        const publicUrl = await saveFileToStorage(file, 'task_attechment');

        // If the file was uploaded successfully, add the URL to the array
        if (publicUrl) {
          uploadedFilesURL.push(publicUrl); // Push URL into array
        }

      } catch (error) {
        console.error(`Error uploading file ${i + 1}:`, error);
      }
    }

    // Update the state with the uploaded files URLs
    await setAttechmentFileURLData(uploadedFilesURL); // This is async, but it'll update after the previous operation
    // handleTaskSubmit(); // You can call handleTaskSubmit here after the state update
  };


  const getOriginalFilename = (file) => {
    const url = file;
    const decodedUrl = decodeURIComponent(url);

    const lastPart = decodedUrl.split('/').pop();
    const fileName = lastPart.split('-TASK_ATTACHMENT')[0];

    return fileName;
  };

  const handleFileClick = (file) => {
    setSelectedFile(file);
  };

  const handlePenClickStartTime = () => {
    setIsEditingTaskStartTime(true);
  }

  const handleCheckClickStartTime = () => {
    handleTaskSubmit();
    setIsEditingTaskStartTime(false);
  }

  const handleFileChangeComment = async (e) => {
    const selectedFiles = e.target.files;

    let uploadedFilesURL = [];

    // Set the comment files state
    await setCommentFiles(selectedFiles);

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];

      try {
        // Save file to storage and get the public URL
        const publicUrl = await saveFileToStorage(file, 'task_comment');

        // If the file was uploaded successfully, add the URL to the array with a dynamic key
        if (publicUrl) {
          const imageKey = `imageURL${i + 1}`; // Generate dynamic key: imageURL1, imageURL2, etc.
          uploadedFilesURL.push({ [imageKey]: publicUrl }); // Push the key-value pair as an object to the array
        }
      } catch (error) {
        console.error(`Error uploading file ${i + 1}:`, error);
      }
    }

    setCommentFileURLData(prevData => [...prevData, ...uploadedFilesURL]);
  };

  const handleAddComment = async (e) => {
    e.preventDefault();

    if (!commentText && (!commentFileURLData || commentFileURLData.length === 0)) {
      toast.error('Please add comment or attach a file first');
      return;
    }

    const commentData = {
      comment: commentText,
      files: commentFileURLData,
      user: userId,
      taskCode
    }

    try {
      const response = await apiCall('productivity/addComment', token, 'POST', commentData)
      toast.success(response.message)
      // Add the comment to the database
      setCommentText('')
      setCommentFileURLData([])
      dispatch(fetchTaskAllData(token, taskCode));
    } catch (error) {
      console.log(error, 'ERROR')
    }

  }

  const toggleFilePreview = () => {
    setIsFilePreviewVisible(prevState => !prevState);
  };

  const toggleUserPreview = () => {
    setIsUserPreviewVisible(prevState => !prevState);
  };

  const toggleTaskTimePreview = () => {
    setIsTaskTimePreviewVisible(prevState => !prevState);
  };

  const dispatch = useDispatch();
  const { projectData, assigneeData, taskAllData, taskData, allUser } = useSelector(
    (state) => state.addTask
  );

  useEffect(() => {
    if (taskData) {
      setTaskCode(taskData.code)
      setTaskTitle(taskData.name);
      setTaskDescription(taskData.description);
      setStartDate(taskData.startDate);
      setEndDate(taskData.endDate);
      setEstimatedTime(taskData.totalTime);
      setSelectedProject(taskData.projectId)
      setSelectedStatus({ value: taskData.status, label: taskData.status })
      setSelectedAssignee(taskData.assignee)
      setCreatedBy(taskData.createdByName)
      setCreatedAt(taskData.createdAt)
      setAttechmentFileURLData(taskData.imageURL)
      setUserData(taskData.users)
    }
  }, [taskData]);

  useEffect(() => {
    if (taskId && userId) {
      dispatch(fetchTaskData(token, taskId, userId));
      dispatch(fetchAllUser(token));
    }
  }, [token, taskId, userId]);

  useEffect(() => {
    if (token && userId) {
      dispatch(fetchProjectData(token, userId));
    }
  }, [token, userId]);

  useEffect(() => {
    if (token && selectedProject) {
      dispatch(fetchAssigneeData(token, selectedProject));
    }
  }, [token, selectedProject]);

  useEffect(() => {
    if (token && taskCode) {
      dispatch(fetchTaskAllData(token, taskCode));
    }
  }, [token, taskCode]);


  const saveFileToStorage = async (file, parameter) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await apiCall(`productivity/upload?fileFor=${parameter}`, token, 'POST', formData);

      if (response.success) {
        // handleToast(response.message);
        if (parameter === 'task_comment' || parameter === 'task_attechment') {
          const publicUrl = response.imageURL;
          // const imageName = response.imageName;
          return publicUrl;
        }
        // handleToast(response.fileName); // Set the uploaded file name in state
      } else {
        handleToast('File upload failed');
      }
    } catch (error) {
      const status = error?.response?.status;

      if (status === 401 || status === 403) {
        localStorage.removeItem('token');

        window.location.href = '/login'; // Force redirect to login
      } else {
        console.error('Error uploading file:', error);
        handleToast('Error uploading file: ' + error);
      }
    }
  };

  const handleTaskSubmit = async () => {
    // Gather task details
    const taskData = {
      name: taskTitle,
      code: taskCode,
      projectId: selectedProject,
      assignee: (selectedAssignee?.value) || null,
      status: (selectedStatus?.value),
      startDate,
      selectedUser,
      endDate,
      totalTime: estimatedTime,
      fileName,
      createdBy: userName,
      imageURL: attechmentFileURLData,
      users: userData
    };
    // Submit task data to the server
    if (taskCode) {
      try {
        const response = await apiCall('productivity/saveTask', token, 'POST', taskData); // Use POST to save task

        if (response) {
          handleToast('Task Updated successfully!');
        } else {
          handleToast('Error creating task');
        }
      } catch (error) {
        console.error('Error creating task:', error);
        handleToast('Error creating task' + error);
      }
    }
  };

  const addTodo = async () => {
    if (inputValue.trim() === '') {
      toast.error("Please Add Task ToDo Title!");
      return;
    }

    const todoData = {
      name: inputValue,
      code: taskCode,
      user: userId
    }

    const newToDo = await apiCall('productivity/addTaskToDo', token, 'POST', todoData);

    setTodos([...taskAllData?.taskToDos, { name: inputValue, isDone: false }]);
    setInputValue('');
    dispatch(fetchTaskAllData(token, taskCode));
  };

  const updateTodo = (index) => {
    Swal.fire({
      title: "Are you sure?",
      text: `You want to Update this Todo Task!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, Update it!"
    }).then(async (result) => {
      if (result.isConfirmed) {
        const newTodos = [...taskAllData?.taskToDos];
        const updateTodoData = {
          id: newTodos[index].id,
          name: newTodos[index].name,
          code: newTodos[index].taskCode,
          isDone: !newTodos[index].isDone,
          user: userId
        }

        const updateTODO = await apiCall('productivity/updateTODO', token, 'POST', updateTodoData)

        toast.success('Task TODO updated!!!')

        newTodos[index].isDone = !newTodos[index].isDone;
        setTodos(newTodos);
      }
    })

  };

  const deleteTodo = (index) => {
    Swal.fire({
      title: "Are you sure?",
      text: `You want to delete this Task TODO?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!"
    }).then(async (result) => {
      if (result.isConfirmed) {
        const newTodo = [...taskAllData?.taskToDos];
        const updateTodoData = {
          id: newTodo[index].id,
          isDone: newTodo[index].isDone,
          isDeleted: 1,
          code: newTodo[index].taskCode,
          user: userId
        }

        const updateTODO = await apiCall('productivity/updateTODO', token, 'POST', updateTodoData)

        toast.success('Task TODO Deleted!!!')
        dispatch(fetchTaskAllData(token, taskCode));
      }
    })
  };

  const handleRemoveFromPreview = (index) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You want to remove this image?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, remove it!"
    }).then((result) => {
      if (result.isConfirmed) {
        setCommentFileURLData((prevData) =>
          prevData.filter((_, i) => i !== index)
        );
      }
    });
  };


  const handleUserChange = (selectedOption) => {
    setUserData(prev => {
      const prevArray = Array.isArray(prev) ? prev : [];
      return [...prevArray, selectedOption.value]; // Add selected user ID
    });
    setSelectedUserOption(null); // Reset the dropdown after selection
  };

  function extractCleanCloudinaryPath(url) {
    const match = url.match(/\/upload\/(?:v\d+\/)?(.+)$/);
    if (!match) return null;

    let decodedPath = decodeURIComponent(match[1]);

    decodedPath = decodedPath.replace(/\.(jpg|jpeg|png|gif|webp)$/i, '');

    return decodedPath;
  }

  function encodeCloudinaryFileName(url) {
    if (!url.includes("-TASK_ATTACHMENT-")) return url; // fallback if not matching pattern

    const [base, suffix] = url.split("-TASK_ATTACHMENT-");

    const lastSlashIndex = base.lastIndexOf("/");
    const path = base.substring(0, lastSlashIndex + 1);
    const fileName = base.substring(lastSlashIndex + 1);

    const encodedFileName = encodeURIComponent(fileName);

    return `${path}${encodedFileName}-TASK_ATTACHMENT-${suffix}`;
  }


  const handleRemoveFileFromAttechment = (file) => {
    Swal.fire({
      title: "Are you sure?",
      text: `You want to Remove this file?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, Remove it!"
    }).then(async (result) => {
      if (result.isConfirmed) {
        const filename = extractCleanCloudinaryPath(file);
        const fileForDB = encodeCloudinaryFileName(file);

        const removeFileFromCloud = await apiCall(`productivity/removeImageFromCloud?fileName=${filename}`, null, 'GET', null)

        const removeFileFromDB = await apiCall(`productivity/removeFileAttechment?fileName=${fileForDB}&taskCode=${taskCode}`, null, 'GET', null)

        if (removeFileFromDB.imageURL) {
          setAttechmentFileURLData(removeFileFromDB.imageURL)
        }
      }
    })
  }

  const projectOptions = Object.entries(projectData).map(([key, value]) => ({ value: value.id, label: value.name }));
  const selectedProjectOption = projectOptions.find(option => option.value === selectedProject);

  const assigneeOptions = Object.entries(assigneeData).map(([key, value]) => ({ value: value.userId, label: value.assignee }));

  const selectedAssigneeOption =
  assigneeOptions.length > 0
    ? assigneeOptions.find(
        (option) => option.value === (selectedAssignee ?? userId)
      ) ?? assigneeOptions[0] 
    : { value: taskData?.assigneeUser?.id, label: taskData?.assigneeUser?.full_name };

  

  const usersOption = Object.entries(assigneeData)
    .filter(([key, value]) => !userData?.includes(value.userId)) // exclude already used userIds
    .map(([key, value]) => ({
      value: value.userId,
      label: value.assignee
    }));

  // Effect to trigger handleTaskSubmit once selectedProject is updated
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (
        selectedProject ||
        selectedStatus ||
        selectedAssignee ||
        startDate ||
        endDate || userData
        || (attechmentFileURLData?.length > 0)
      ) {
        if (isReload) {
          handleTaskSubmit();
        }
        satIsReload(true);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [
    selectedProject,
    selectedStatus,
    selectedAssignee,
    startDate,
    endDate,
    userData,
    attechmentFileURLData
  ]);

  const [loading, setLoading] = useState(false);

  const handleImageLoad = () => {
    setLoading(false);
  };

  const isImage = (url) => {
    return url && (url.match(/\.(jpeg|jpg|gif|png|bmp|webp)$/i));
  };

  const formatDuration = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const remainingSeconds = totalSeconds % 3600;
    const minutes = Math.floor(remainingSeconds / 60);
    const seconds = remainingSeconds % 60;

    return [
      hours.toString().padStart(2, '0'),
      minutes.toString().padStart(2, '0'),
      seconds.toString().padStart(2, '0')
    ].join(':');
  };

  // First, let's properly group the tasks by user
  const groupedTasks = taskAllData?.taskTimers?.reduce((acc, task) => {
    const userId = task.userId; // Note: using task.userId directly since User object isn't nested

    if (!acc[userId]) {
      acc[userId] = {
        full_name: task.User?.full_name || `User ${userId}`, // Handle cases where User object might be missing
        initials: (task.User?.full_name || `User ${userId}`)
          .split(' ')
          .map(name => name.charAt(0).toUpperCase())
          .slice(0, 2)
          .join(''),
        totalDuration: 0,
      };
    }

    // Parse duration safely
    const [hours, minutes, seconds] = task.duration.split(':').map(Number);
    acc[userId].totalDuration += hours * 3600 + minutes * 60 + seconds;

    return acc;
  }, {});

  return (
    <Layout>
      <div className='row'>
        <div className="task-main-title d- align-items-center mb-2">

          <div className="d-flex" style={{ width: '100%' }}>
            {!(isEditingTaskTitle) && (
              <h4 className="mb-0 d-flex align-items-center">
                {taskTitle}
              </h4>
            )
            }
            {(isEditingTaskTitle) && (
              <input
                type="text"
                name='taskTitle'
                placeholder="Task Title"
                className="form-control p-0"
                id="taskTitle"
                value={taskTitle || ''}
                onChange={(e) => setTaskTitle(e.target.value)}
                style={{ width: 'auto', border: 'none', fontSize: '1.5rem' }}
              />
            )}

            <button
              className="btn bgnone m-0"
              onClick={isEditingTaskTitle ? handleCheckClickTitle : handlePenClickTitle}
              style={{ marginRight: '10px', color: '#338db5' }}
            >
              {!isEditingTaskTitle && <i className="fa-solid fa-pen"></i>}
              {isEditingTaskTitle && <i className="fa-solid fa-circle-check"></i>}
            </button>
          </div>

        </div>
      </div>

      <div className='row'>
        <span className='pb-2 mb-2' style={{ color: 'gray' }}>#{taskCode || taskId}</span>
        <div className="border-bottom"></div>
      </div>

      <div className="row">
        <div className="col-md-6 col-lg-7 mt-3">

          <div className='row'>
            <div className='' style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', alignContent: 'center' }}>
              <h5 className="mb-0 task-titles">
                Task Description
              </h5>
              <button
                className="btn bgnone m-0"
                onClick={isEditingDescription ? handleCheckClickDescription : handlePenClickDescription}
                style={{ marginRight: '10px', color: '#338db5' }}
              >
                {!isEditingDescription && <i className="fa-solid fa-pen"></i>}
                {isEditingDescription && <i className="fa-solid fa-circle-check"></i>}
              </button>
            </div>

            {isEditingDescription ? (
              <input
                type="textArea"
                name="description"
                className="form-control"
                value={taskDescription || ''}
                onChange={(e) => setTaskDescription(e.target.value)} // Allow editing description
                style={{ width: '100%', border: 'none', color: '#8d8d8d' }}
              />
            ) : (
              <div className="task-description-text" style={{ color: '#8d8d8d' }}>{taskDescription}</div>
            )}
          </div>

          <div className='row mt-4'>
            <div className="todo-list">

              {/* to do display content */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', alignContent: 'center' }}>
                <h5 className="mb-0 task-titles">
                  Task To-Do List
                </h5>
                <button className="btn bgnone m-0"
                  onClick={isEditingTaskTODO ? handleCheckClickTaskTODO : handlePenClickTaskTODO}
                  style={{ marginRight: '10px', color: '#338db5' }}>
                  {!isEditingTaskTODO && <i className="fa-solid fa-circle-plus"></i>}
                  {isEditingTaskTODO && <i className="fa-solid fa-circle-xmark"></i>}

                </button>
              </div>

              {/* to do title */}
              {isEditingTaskTODO &&
                <div className="input-group mb-3">
                  <input type="text" className="form-control form-control " placeholder="Todo title" value={inputValue || ''} onChange={(e) => setInputValue(e.target.value)
                  }
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addTodo();
                      }
                    }}
                    style={{ width: '90%', border: '1px solid gray' }} />
                  <span className="input-group-text" id="basic-addon2" onClick={addTodo} style={{ backgroundColor: '#338db5', color: 'white', border: '1px solid #338db5' }}>
                    <i className="fa-solid fa-pen-to-square"></i>
                  </span>
                </div>

              }

              {/* exist to dos */}
              <div className='todo-display-section'>
                <ul className="todo-items px-md-0 m-2" style={{ margin: 0, padding: 0, listStyleType: 'none' }}>
                  {taskAllData?.taskToDos?.map((todo, index) => (

                    <li
                      className='mb-2 pe-4'
                      key={index}
                      onClick={() => updateTodo(index)}
                      style={{
                        width: '100%',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        position: 'relative',
                        padding: '12px 8px 12px 40px',
                        background: '#f1ecec',
                        fontSize: '18px',
                        transition: '0.2s',
                        userSelect: 'none',
                        ...(todo.isDone && {
                          background: '#d3f8d3',
                          color: 'grey',
                          textDecoration: 'line-through'
                        })
                      }}
                    >
                      <input
                        type='checkbox'
                        checked={todo.isDone}
                        onChange={() => updateTodo(index)}
                        style={{
                          position: 'absolute',
                          left: '16px',
                          height: '25px',
                        }}
                      ></input>
                      {todo.name}
                      <i className="p-2 fa-solid fa-circle-xmark"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteTodo(index);
                        }}
                        style={{
                          position: 'absolute',
                          right: 0,
                          top: 8,
                          color: '#fd6e6e',
                        }}></i>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className='row m-0 mt-2'>
            <div className='card m-0 p-0 mt-2'>
              <div className="card-body px-1 py-2" >
                <div className="task-titles px-2 mb-3">
                  <span className="task-titles-border" style={{ textDecoration: 'underline', textDecorationColor: '#cdb3a2' }}>Comments</span>
                </div>
                <div>
                  <div style={{
                    border: '1px solid gray',
                    borderRadius: '10px'
                  }}>
                    {commentFileURLData && commentFileURLData.length > 0 && (
                      <>
                        <div className="attachments-container mt-1">
                          <div className='attachment-item'>
                            <div className="p-2" style={{ display: 'flex' }}>
                              {loading && (
                                <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', alignContent: 'center' }}>
                                  <div
                                    className="spinner-border spinner-border-lg"
                                    role="status"
                                    style={{ color: '#338db5', }}
                                  >
                                  </div>
                                </div>
                              )}
                              {commentFileURLData.map((file, index) => {
                                const imageKey = Object.keys(file)[0];
                                const imageURL = file[imageKey];

                                return (
                                  <div key={index} className="attachment-container" style={{
                                    position: 'relative',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    width: '100px',
                                    height: '100px',
                                    margin: '5px',
                                    display: 'flex'
                                  }}>
                                    {isImage(imageURL) ? (
                                      <img
                                        src={imageURL}
                                        alt={`attachment-${index}`}
                                        className="m-2 attachment-preview"
                                        style={{
                                          width: '100%',
                                          height: '100%',
                                          objectFit: 'contain',
                                        }}
                                        onLoad={handleImageLoad}
                                      />
                                    ) : (
                                      <i className="fa-solid fa-file-lines"
                                        style={{
                                          color: '#338DB5',
                                          fontSize: '4rem',  // Adjust font size for the icon
                                          width: '100%',
                                          height: '100%',
                                          display: 'flex',
                                          justifyContent: 'center',
                                          alignItems: 'center',
                                          border: '1px solid #ccc',
                                          borderRadius: '4px', // Optional for rounded corners
                                        }}>

                                      </i>
                                    )}

                                    <button
                                      className="close-btn-on-image"
                                      onClick={() => handleRemoveFromPreview(index)}
                                    >
                                      &times;
                                    </button>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                        <hr className='m-0' />
                      </>
                    )}
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <textarea
                        className="mx-3"
                        name='commentText'
                        placeholder="Write your comment here..."
                        value={commentText || ''}
                        onChange={(e) => setCommentText(e.target.value)}
                        style={{ width: '700px', height: '30px', border: 'none', margin: '5px', resize: 'none' }}
                      />
                      <div style={{ display: 'flex', alignItems: 'center' }}>

                        <label htmlFor="comment-file-upload" className="custom-file-upload" style={{ color: '#338db5', border: 'none' }}>
                          <i className="fa-solid fa-paperclip"></i>
                        </label>
                        <input id="comment-file-upload" type="file" multiple onChange={handleFileChangeComment} />

                        <button
                          className="btn bgnone mt-0"
                          onClick={handleAddComment}
                          style={{ color: '#338db5' }}
                        >
                          <i className="fa-solid fa-paper-plane"></i>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* comment display section */}
                  <div className='comment-display-section' style={{ border: '1px solid greens' }}>
                    {taskAllData && taskAllData?.taskComments?.length > 0 && (
                      taskAllData?.taskComments?.map((comment) => (
                        <div className="d-flex align-items-center" key={comment.id}>
                          <div
                            className="p-2"
                            style={{ backgroundColor: '#3d42b3eb', color: 'white', borderRadius: '50%', height: 'auto', minWidth: '36px', textAlign: 'center' }}
                          >
                            {comment.User.full_name && comment.User.full_name.split(' ').map(name => name.charAt(0).toUpperCase()).slice(0, 2).join('')}
                          </div>
                          <div className="comment-card w-100 card">
                            <div className="p-2 card-body">
                              <div className="d-flex justify-content-between align-items-center flex-wrap">
                                <h6 className="text-dark px-2">
                                  {comment.User.full_name}
                                </h6>
                                <h6 className="mb-0 px-2">
                                  {new Date(comment.createdAt).toLocaleString('en-GB', {
                                    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit',
                                    hour12: true,
                                  })}
                                </h6>
                              </div>

                              {!expanded && (
                                <h6 className="mb-0 px-2">
                                  {comment.text.length > 250
                                    ? `${comment.text.slice(0, 250)}...`
                                    : comment.text}
                                </h6>
                              )}

                              {expanded && (
                                <h6 className="mb-0 px-2">
                                  {comment.text}
                                </h6>
                              )}

                              {comment.text.length > 250 && (
                                <button
                                  className="btn bgnone p-0 mt-0 px-2"
                                  style={{ color: '#3d42b3' }}
                                  onClick={() => setExpanded((prev) => !prev)}
                                >
                                  {expanded ? 'View Less' : 'View More'}
                                </button>
                              )}

                              <div className="attachments-container mt-1">
                                <div className="attachment-item">
                                  {comment.imageURL && comment.imageURL.length > 0 && (
                                    <>
                                      {comment.imageURL.map((image, index) => {
                                        const imageKey = Object.keys(image)[0];
                                        const fileUrl = image[imageKey];

                                        // Function to check if file is image
                                        const isImage = (url) => {
                                          const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
                                          return imageExtensions.some((ext) =>
                                            url.toLowerCase().includes(ext)
                                          );
                                        };

                                        const isPDF = (url) => {
                                          return url.toLowerCase().endsWith('.pdf');
                                        };

                                        return isImage(fileUrl) ? (
                                          <img
                                            key={index}
                                            src={fileUrl}
                                            alt={`Attachment preview ${index}`}
                                            className="m-2 attachment-preview pointer"
                                            style={{ width: '100px', height: '100px' }}
                                            onClick={() => {
                                              handleFileClick(fileUrl);
                                              setModalShow(true);
                                            }}
                                          />
                                        ) : isPDF(fileUrl) ? (

                                          <div
                                            key={index}
                                            className="m-2 d-flex flex-column align-items-center pointer"
                                            style={{ width: '100px', height: '100px', justifyContent: 'center', border: '1px solid #ccc' }}
                                            onClick={() => {
                                              handleFileClick(fileUrl);
                                              setModalShow(true);
                                            }}
                                          >
                                            <i className="fa-solid fa-file-lines" style={{ fontSize: '4rem', color: '#338DB5' }}></i>
                                          </div>
                                        ) : (
                                          <div
                                            key={index}
                                            className="m-2 d-flex flex-column align-items-center pointer"
                                            style={{ width: '100px', height: '100px', justifyContent: 'center', border: '1px solid #ccc' }}
                                          >
                                            <a href={fileUrl} download>
                                              <i className="fa-solid fa-file-lines" style={{ fontSize: '4rem', color: '#338DB5' }}></i>
                                            </a>
                                          </div>
                                        )
                                      })}
                                    </>
                                  )}
                                </div>
                              </div>

                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Task Details Options */}
        <div className="col-md-6 col-lg-5 task-detail-side border-line-responsive">
          <ul className="tasks-items mt-2 col-lg-10 px-1 px-md-4">

            <div className="details my-2">
              <div className='row'>
                <div className="detail-item">
                  <i className="fa-solid fa-briefcase px-2" style={{ color: '#9b9fa7' }} ></i>
                  <span>Project : </span>
                  <SelectInput
                    placeholder={'Select Project'}
                    value={selectedProjectOption}
                    changeColor={true}
                    onChange={(e) => {
                      setSelectedProject(e?.value ? e?.value : null);
                    }}
                    style={{ backgroundColor: '#EFF2F8' }}
                    options={projectOptions}
                    isClearable={false}
                  />
                </div>
              </div>
            </div>

            <div className="details my-2">
              <div className='row'>
                <div className="detail-item">
                  <i className="fa-solid fa-spinner px-2" style={{ color: '#9b9fa7' }} ></i>
                  <span>Status : </span>
                  <SelectInput
                    placeholder={'Select Status'}
                    value={selectedStatus}
                    changeColor={true}
                    onChange={(e) => {
                      setSelectedStatus(e);
                    }}
                    style={{ backgroundColor: '#EFF2F8' }}
                    isClearable={false}
                    options={[
                      { value: 'In-Progress', label: 'In-Progress' },
                      { value: 'Done', label: 'Done' },
                      { value: 'Completed', label: 'Completed' },
                      { value: 'Deployed', label: 'Deployed' },
                      { value: 'Backlog', label: 'Backlog' },
                    ]}
                  />
                </div>
              </div>
            </div>

            <div className="details my-2">
              <div className='row'>
                <div className="detail-item">
                  <div>
                    <i className="fa-solid fa-id-badge px-2" style={{ color: '#9b9fa7' }} ></i>
                    <span>Assignee : </span>
                  </div>
                  <SelectInput
                    placeholder={'Select Assignee'}
                    value={selectedAssigneeOption}
                    changeColor={true}
                    onChange={(selectedOption) => {
                      setSelectedAssignee(selectedOption);
                    }}
                    style={{ backgroundColor: '#EFF2F8' }}
                    options={assigneeOptions}
                    isClearable={false}
                  />
                </div>
              </div>
            </div>

            <div className="details my-2">
              <div className='row'>
                <div className="detail-item">
                  <i className="fa-solid fa-calendar-plus px-2" style={{ color: '#9b9fa7' }} ></i>
                  <span>Start Date : </span>
                  <DatePicker
                    className='reactdatePicker'
                    selected={startDate}
                    onSelect={(e) => {
                      setStartDate(e)
                    }}
                    onChange={(e) => {
                      setStartDate(e)
                      setEndDate(null)
                    }}
                    dateFormat="dd/MM/yyyy"
                    clearButtonTitle={'Delete'}
                    isClearable={true}
                    clearButtonClassName='m-0 p-0 mx-5'
                    onChangeRaw={() => {
                      setStartDate(null);
                      setEndDate(null)
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="details my-2">
              <div className='row'>
                <div className="detail-item">
                  <i className="fa-solid fa-calendar-plus px-2" style={{ color: '#9b9fa7' }} ></i>
                  <span>End Date : </span>
                  <DatePicker
                    className='reactdatePicker'
                    selected={endDate}
                    onSelect={(e) => {
                      setEndDate(e)
                    }}
                    onChange={(e) => {
                      setEndDate(e)
                    }}
                    dateFormat="dd/MM/yyyy"
                    clearButtonTitle={'Delete'}
                    isClearable={true}
                    clearButtonClassName='m-0 p-0 mx-5'
                    onChangeRaw={() => setEndDate(null)}
                    minDate={startDate}
                    disabled={!startDate}
                  />
                </div>
              </div>
            </div>

            <div className="details my-2">
              <div className='row'>
                <div className="detail-item">
                  <i className="fa-solid fa-stopwatch px-2" style={{ color: '#9b9fa7' }} ></i>
                  <span>Estimated Time : </span>
                  {!isEditingTaskStartTime &&
                    <div>
                      {estimatedTime === '00:00:00'
                        ? '00:00'
                        : estimatedTime?.split(':').slice(0, 2).map(time => time.padStart(2, '0')).join(':')}
                    </div>
                  }
                  {(isEditingTaskStartTime) && (
                    <div className="d-flex">
                      <input
                        type="text"
                        className="form-control timeButton p-0"
                        placeholder="HH"
                        aria-label="hours"
                        value={estimatedTime && estimatedTime.split(':')[0] !== '00' ? estimatedTime.split(':')[0] : ''}
                        onChange={(e) => {
                          const updatedHours = e.target.value;

                          // Check if the input is a valid number (only digits allowed)
                          if (/^\d{0,2}$/.test(updatedHours)) {
                            setEstimatedTime(`${updatedHours || '00'}:${estimatedTime.split(':')[1]}`);
                          }
                        }}
                        style={{
                          backgroundColor: '#EFF2F8',
                        }}
                      />
                      <span className="input-group-text" style={{
                        border: 'none', // Mimic the border of the time input
                        backgroundColor: '#EFF2F8',
                        padding: '0px',
                      }}>:</span>
                      <input
                        type="text"
                        className="form-control timeButton p-0"
                        placeholder="MM"
                        aria-label="minutes"
                        value={estimatedTime && estimatedTime.split(':')[1] !== '00' ? estimatedTime.split(':')[1] : ''}
                        onChange={(e) => {
                          let updatedMinutes = e.target.value;

                          // Ensure only numeric characters are input
                          if (/^\d{0,2}$/.test(updatedMinutes)) {
                            if (updatedMinutes.length === 2) {
                              if (parseInt(updatedMinutes) <= 59) {
                                setEstimatedTime(`${estimatedTime.split(':')[0]}:${updatedMinutes}`);
                              }
                            } else {
                              setEstimatedTime(`${estimatedTime.split(':')[0]}:${updatedMinutes.padStart(2, '')}`);
                            }
                          }
                        }}
                        style={{
                          backgroundColor: '#EFF2F8',
                        }}
                      />
                    </div>
                  )}

                  <button
                    className="btn bgnone m-0 px-1"
                    onClick={isEditingTaskStartTime ? handleCheckClickStartTime : handlePenClickStartTime}
                    style={{ marginRight: '10px', color: '#338db5' }}
                  >
                    {!isEditingTaskStartTime && <i className="fa-solid fa-pen"></i>}
                    {isEditingTaskStartTime && <i className="fa-solid fa-circle-check"></i>}
                  </button>
                </div>
              </div>
            </div>

            <div className="details my-2">
              <div className='row'>
                <div className="detail-item">
                  <i className="fa-solid fa-user-group px-2" style={{ color: '#9b9fa7' }} ></i>
                  <span>Users : </span>
                  {userData?.map((id, index) => {
                    // Use assigneeData to find user details
                    const user = allUser?.data?.find(u => u.id === id);
                    const initials = user?.full_name
                      ? user.full_name.split(' ').map(name => name[0].toUpperCase()).slice(0, 2).join('')
                      : '';
                    return (
                      <div
                        key={index}
                        className="p-1 mx-1"
                        style={{
                          backgroundColor: '#3d42b3eb',
                          color: 'white',
                          borderRadius: '50%',
                          height: 'auto',
                          minWidth: '31px',
                          textAlign: 'center'
                        }}
                      >
                        {initials}
                      </div>
                    );
                  })}
                    <SelectInput
                    onlyArrow={true}
                      placeholder={'Select User'}
                      value={selectedUserOption} 
                      changeColor={true}
                      onChange={handleUserChange}
                      style={{ backgroundColor: '#EFF2F8' }}
                      options={usersOption}
                      isClearable={false}
                    />
                  {userData?.length > 0 &&
                    <span className="ms-auto pe-2" onClick={toggleUserPreview}>
                      <i
                        className={`fa-solid ${(isUserPreviewVisible) ? 'fa-chevron-up' : 'fa-chevron-down'} px-2`}
                        style={{ color: '#9b9fa7' }}
                      ></i>
                    </span>
                  }
                </div>
              </div>
            </div>

            {isUserPreviewVisible && userData?.length > 0 &&
              <div className="details my-2">
                <div className="row">
                  {userData.map((id, index) => {
                    const assignees = Object.values(assigneeData);
                    const user = allUser?.data?.find(u => u.id === id);
                    const initials = user?.full_name
                      ? user.full_name.split(' ').map(name => name[0].toUpperCase()).slice(0, 2).join('')
                      : '';
                    return (
                      <div key={index} className="detail-item mx-4">
                        <div
                          className="p-1 mx-1"
                          style={{
                            backgroundColor: '#3d42b3eb',
                            color: 'white',
                            borderRadius: '50%',
                            height: 'auto',
                            minWidth: '31px',
                            textAlign: 'center'
                          }}
                        >
                          {initials}
                        </div>
                        <div className="file-preview">
                          <ul className='px-0'>
                            {user?.full_name}
                          </ul>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            }

            <div className="details my-2">
              <div className='row'>
                <div className="detail-item">
                  <i className="fa-solid fa-paperclip px-2" style={{ color: '#9b9fa7' }}></i>
                  <span>Attachments ({attechmentFileURLData?.length || 0}) : </span>
                  <label htmlFor="task-file-upload" className="custom-file-upload" style={{ color: '#338db5', border: 'none' }}>
                    <i className="fa-solid fa-circle-plus ps-2">
                      <input id="task-file-upload" type="file" multiple onChange={handleFileChangeTask} />
                    </i>
                  </label>
                  {attechmentFileURLData &&
                    <span className="ms-auto pe-2" onClick={toggleFilePreview}>
                      <i
                        className={`fa-solid ${isFilePreviewVisible ? 'fa-chevron-up' : 'fa-chevron-down'} px-2`}
                        style={{ color: '#9b9fa7' }}
                      ></i>
                    </span>
                  }
                </div>
              </div>
            </div>
            {isFilePreviewVisible && attechmentFileURLData?.length > 0 &&
              attechmentFileURLData.map((file, index) => {
                const fileUrl = file; // Assuming `file` is the URL to the file
                const fileName = getOriginalFilename(file); // Assuming this is a helper function for the filename

                // Function to check if the file is an image
                const isImage = (url) => {
                  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
                  return imageExtensions.some((ext) => url.toLowerCase().includes(ext));
                };

                // Function to check if the file is a PDF
                const isPDF = (url) => {
                  return url.toLowerCase().endsWith('.pdf');
                };

                return (
                  <div className="details my-2" key={index}>
                    <div className="row">
                      <div className="detail-item">
                        <i className="fa-solid fa-file-lines px-3" style={{ color: '#9b9fa7' }}></i>
                        <div className="file-preview">
                          <ul className='px-1'>
                            <span
                              className='image-name truncate-text'
                              onClick={() => {
                                // Handle file click
                                handleFileClick(file);

                                if (isImage(file)) {
                                  setModalShow(true); // Show modal for image preview
                                } else if (isPDF(file)) {
                                  setModalShow(true); // Show modal for PDF preview
                                } else {
                                  // Handle other files, e.g., allow for downloading
                                  window.open(file, '_blank'); // Opens the file in a new tab for download or viewing
                                }
                              }}
                            >
                              {fileName}
                            </span>
                          </ul>
                        </div>
                        <span
                          className="ms-auto pe-2"
                          onClick={() => handleRemoveFileFromAttechment(file)}
                        >
                          <i className="fa-solid fa-circle-xmark px-2" style={{ color: '#fd6e6e' }}></i>
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            }

            {Object.keys(taskAllData).length !== 0 &&
              <div className="details my-2">
                <div className='row'>
                  <div className="detail-item">
                    <i className="fa-solid fa-stopwatch px-2" style={{ color: '#9b9fa7' }} ></i>
                    <span>Users Task Time</span>
                    <span className="ms-auto pe-2" onClick={toggleTaskTimePreview}>
                      <i
                        className={`fa-solid ${isTaskTimePreviewVisible ? 'fa-chevron-up' : 'fa-chevron-down'} px-2`}
                        style={{ color: '#9b9fa7' }}
                      ></i>
                    </span>
                  </div>
                </div>
              </div>
            }

            {isTaskTimePreviewVisible && taskAllData?.taskTimers && (
              <div className="details my-2">
                <div className="row">
                  <div className="detail-item">
                    {Object.values(groupedTasks).map((user, index) => (
                      <div className="file-preview" key={index}>
                        <ul className="d-flex">
                          <div className="p-1 m-1"
                            style={{
                              backgroundColor: '#3d42b3eb',
                              color: 'white',
                              borderRadius: '50%',
                              minWidth: '36px',
                              textAlign: 'center',
                            }}>
                            {user.initials}
                          </div>
                          <span className="align-content-center px-2">
                            {user.full_name}: {formatDuration(user.totalDuration)}
                          </span>
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}


            <div className="details my-2">
              <div className='row'>
                <div className="detail-item">
                  <i className="fa-solid fa-user-pen px-2" style={{ color: '#9b9fa7' }} ></i>
                  <span>Created By  :</span>
                  <span className='px-1'>{createdBy ? createdBy : userName}</span>
                </div>
              </div>
            </div>

            <div className="details my-2">
              <div className='row'>
                <div className="detail-item">
                  <i className="fa-regular fa-clock px-2" style={{ color: '#9b9fa7' }} ></i>
                  <span>Created At  :  </span>
                  <span className='px-1'>
                    {new Date(createdAt || date).toLocaleString('en-GB', {
                      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true,
                    })}
                  </span>
                </div>
              </div>
            </div>

          </ul>
        </div>

      </div>

      {modalShow && (
        <ModalComponent
          show={modalShow}
          onHide={() => setModalShow(false)}
          title="Media Viewer"
          size='xl'
          bodyContent={
            selectedFile ? (
              selectedFile.endsWith('.pdf') ? (
                <div
                  style={{ height: '70vh', width: '80vw' }}
                >
                  <PDFView fileUrl={selectedFile} />
                </div>
              ) : (

                <img
                  src={selectedFile}
                  alt="Media File"
                  className="img-fluid"
                  style={{ maxHeight: '70vh', width: '100%', objectFit: 'contain' }}
                />
              )
            ) : (
              <div>No file selected.</div>
            )
          }
        />
      )}


    </Layout>
  );
}

export default AddTask;