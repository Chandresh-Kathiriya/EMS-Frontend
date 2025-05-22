import { apiCall } from "../../Components/API";

export const FETCH_TASK = 'FETCH_TASK';
export const SET_TASK_DATA = 'SET_TASK_DATA';
export const FETCH_ALL_TASK = 'FETCH_ALL_TASK';
export const SET_ALL_TASK_DATA = 'SET_ALL_TASK_DATA';
export const FETCH_PROJECT = 'FETCH_PROJECT';
export const SET_PROJECT_DATA = 'SET_PROJECT_DATA';
export const FETCH_USER = 'FETCH_USER';

export const setTaskData = (data) => ({
  type: SET_TASK_DATA,
  payload: data,
});
export const setAllTaskData = (data) => ({
  type: SET_ALL_TASK_DATA,
  payload: data,
});
export const setProjectData = (data) => ({
  type: SET_PROJECT_DATA,
  payload: data,
});

export const fetchTaskData = (token, params) => async (dispatch) => {
  try {
    const data = {
      per_page: params.per_page,
      page: params.page,
      project: params.project,
      assignee: params.assignee,
      task: params.task,
      taskStatus: params.taskStatus,
      dateFrom: params.dateFrom,
      dateTo: params.dateTo,
      user: params.user
    }
    const taskResponse = await apiCall(`productivity/getalltasks`, token, 'POST', data);
    dispatch(setTaskData(taskResponse));
    const filterData = {
      user: params.user
    }
    const allTaskResponse = await apiCall(`productivity/getalltasks`, token, 'POST', filterData);
    dispatch(setAllTaskData(allTaskResponse));

  } catch (error) {
    console.error('Error fetching Task:', {
      error: error.message,
      page: params.page,
      per_page: params.per_page
    });
  }
};

export const fetchUser = (token) => async (dispatch) => {
  try {
    // Make the API call
    let userResponse = await apiCall('users/getAllUsersForAttendanceReport', token, 'POST', null);

    dispatch({ type: FETCH_USER, payload: userResponse });

  } catch (error) {
    console.error('Error fetching Week Off Data:', {
      error: error.message,
    });
  }
};

export const fetchProjectData = (token, user) => async (dispatch) => {
  try {
    const data = {
      user
    }
    let projectResponse;
    projectResponse = await apiCall(`productivity/getAllProject`, token, 'POST', data);

    dispatch(setProjectData(projectResponse));

  } catch (error) {
    console.error('Error fetching Projects:', {
      error: error.message,
    });
  }
};