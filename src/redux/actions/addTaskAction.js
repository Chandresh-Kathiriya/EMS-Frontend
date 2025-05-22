import { apiCall } from "../../Components/API";

export const FETCH_TASK = 'FETCH_TASK';
export const SET_TASK_DATA = 'SET_TASK_DATA';
export const FETCH_PROJECT = 'FETCH_PROJECT';
export const SET_PROJECT_DATA = 'SET_PROJECT_DATA';
export const FETCH_ASSIGNEE = 'FETCH_ASSIGNEE';
export const SET_ASSIGNEE_DATA = 'SET_ASSIGNEE_DATA';
export const FETCH_TASK_ALL_DATA = 'FETCH_TASK_ALL_DATA';
export const SET_TASK_ALL_DATA = 'SET_TASK_ALL_DATA';
export const FETCH_USER_NAME = 'FETCH_USER_NAME';
export const FETCH_ALL_USER = 'FETCH_ALL_USER';
export const SET_ALL_USER = 'SET_ALL_USER';


// Action to set PROJECT data
export const setTaskData = (data) => ({
  type: SET_TASK_DATA,
  payload: data,
});

// Action to set PROJECT data
export const setProjectData = (data) => ({
  type: SET_PROJECT_DATA,
  payload: data,
});

// Action to set Assignee data
export const setAssigneeData = (data) => ({
  type: SET_ASSIGNEE_DATA,
  payload: data,
});

// Action to set Assignee data
export const setTaskAllData = (data) => ({
  type: SET_TASK_ALL_DATA,
  payload: data,
});

export const setAllUser = (data) => ({
  type: SET_ALL_USER,
  payload: data,
});


// Thunk to fetch PROJECT data
export const fetchTaskData = (token, taskId, userId) => async (dispatch) => {
  try {
    const data = {
      taskId,
      userId
    }

    // Make the API call
    let taskResponse = await apiCall(`productivity/checkEditNew`, token, 'POST', data);
    dispatch(setTaskData(taskResponse.data));

  } catch (error) {
    const status = error?.response?.status;

    if (status === 401 || status === 403) {
      localStorage.removeItem('token');

      window.location.href = '/login'; // Force redirect to login
    } else {
      console.error('Error fetching Task Data:', {
        error: error.message,
      });
    }
  }
};

// Thunk to fetch PROJECT data
export const fetchProjectData = (token, userId) => async (dispatch) => {
  try {
    // Make the API call
    let projectResponse = await apiCall(`productivity/getProject/${userId}`, token, 'POST', null);
    dispatch(setProjectData(projectResponse.data));

  } catch (error) {
    const status = error?.response?.status;

    if (status === 401 || status === 403) {
      localStorage.removeItem('token');

      window.location.href = '/login'; // Force redirect to login
    } else {
      console.error('Error fetching Projects:', {
        error: error.message,
      });
    }
  }
};

// Thunk to fetch Assignee data
export const fetchAssigneeData = (token, projectId) => async (dispatch) => {
  try {
    // Make the API call
    let assigneeResponse = await apiCall(`productivity/getAssignee/${projectId}`, token, 'POST', null);
    dispatch(setAssigneeData(assigneeResponse.data));

  } catch (error) {
    const status = error?.response?.status;

    if (status === 401 || status === 403) {
      localStorage.removeItem('token');

      window.location.href = '/login'; // Force redirect to login
    } else {
      console.error('Error fetching Assignee:', {
        error: error.message,
      });
    }
  }
};

// Thunk to fetch task timer data
export const fetchTaskAllData = (token, taskCode) => async (dispatch) => {
  try {
    let taskAllResponse = await apiCall(`productivity/getTaskDetails/${taskCode}`, token, 'POST', null);

    dispatch(setTaskAllData(taskAllResponse?.data));

  } catch (error) {
    const status = error?.response?.status;

    if (status === 401 || status === 403) {
      localStorage.removeItem('token');

      window.location.href = '/login'; // Force redirect to login
    } else {
      console.error('Error fetching Assignee:', {
        error: error.message,
      });
    }
  }
};

export const fetchAllUser = (token) => async (dispatch) => {
  try {
    // Make the API call
    let allUserResponse = await apiCall('users/getAllUsersForAttendanceReport', token, 'POST', null);

    // // Dispatch the fetched data
    dispatch(setAllUser(allUserResponse));

  } catch (error) {
    const status = error?.response?.status;

    if (status === 401 || status === 403) {
      localStorage.removeItem('token');

      window.location.href = '/login'; // Force redirect to login
    } else {
      console.error('Error fetching all User Data:', {
        error: error.message,
      });
    }
  }
};