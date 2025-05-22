import { apiCall } from '../../Components/API';

export const FETCH_TASK_TIMER = 'FETCH_TASKS_TIMER';
export const FETCH_TASK = 'FETCH_TASKS';
export const FETCH_USER = 'FETCH_USER';
export const DELETE_TASK_TIMER = 'DELETE_TASK_TIMER';

export const fetchTaskTimer = (token, params) => async (dispatch) => {
  try {
    const data = {
      token,
      per_page: params.per_page,
      page: params.page,
      userId: params.taskUser ?? params.userId,
      taskCode: params.taskCode,
      dateFrom: params.dateFrom,
      dateTo: params.dateTo,
    }
    const taskTimerResponse = await apiCall('productivity/getAllTaskTimer', token, 'POST', data);
    dispatch({ type: FETCH_TASK_TIMER, payload: taskTimerResponse });
  } catch (error) {
    const status = error?.response?.status;

    if (status === 401 || status === 403) {
      localStorage.removeItem('token');

      window.location.href = '/login'; // Force redirect to login
    } else {
      console.error('Error fetching assignees:', error);
    }
  }
};

export const deleteTaskTimer = (id, token) => async (dispatch) => {
  try {
    const response = await apiCall(`productivity/deleteTaskTimerById/${id}`, token, 'POST', null);
    dispatch({ type: DELETE_TASK_TIMER, payload: id });
  } catch (error) {
    console.error('Error deleting task timer:', error);
  }
};

export const fetchTask = (token) => async (dispatch) => {
  try {

    const taskResponse = await apiCall(`productivity/getalltasks`, token, 'POST', null);

    dispatch({ type: FETCH_TASK, payload: taskResponse });

  } catch (error) {
    const status = error?.response?.status;

    if (status === 401 || status === 403) {
      localStorage.removeItem('token');

      window.location.href = '/login'; // Force redirect to login
    } else {
      console.error('Error fetching Task:', {
        error: error.message,
      });
    }
  }
};

export const fetchUser = (token) => async (dispatch) => {
  try {
    // Make the API call
    let userResponse = await apiCall('users/getAllUsersForAttendanceReport', token, 'POST', null);

    // // Dispatch the fetched data
    dispatch({ type: FETCH_USER, payload: userResponse });

  } catch (error) {
    const status = error?.response?.status;

    if (status === 401 || status === 403) {
      localStorage.removeItem('token');

      window.location.href = '/login'; // Force redirect to login
    } else {
      console.error('Error fetching Week Off Data:', {
        error: error.message,
      });
    }
  }
};