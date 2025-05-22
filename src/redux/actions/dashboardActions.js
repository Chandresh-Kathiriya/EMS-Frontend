// src/redux/actions/dashboardActions.js

import { apiCall } from '../../Components/API';

// Action Types
export const FETCH_DASHBOARD_DATA_REQUEST = 'FETCH_DASHBOARD_DATA_REQUEST';
export const FETCH_DASHBOARD_DATA_SUCCESS = 'FETCH_DASHBOARD_DATA_SUCCESS';
export const FETCH_DASHBOARD_DATA_FAILURE = 'FETCH_DASHBOARD_DATA_FAILURE';

export const SET_ATTENDANCE_DATA = 'SET_ATTENDANCE_DATA';
export const SET_PENDINGTASKS_DATA = 'SET_PENDINGTASKS_DATA';

// Action Creators
export const fetchDashboardDataRequest = () => ({ type: FETCH_DASHBOARD_DATA_REQUEST });
export const fetchDashboardDataSuccess = (data) => ({
  type: FETCH_DASHBOARD_DATA_SUCCESS,
  payload: data,
});
export const fetchDashboardDataFailure = (error) => ({
  type: FETCH_DASHBOARD_DATA_FAILURE,
  payload: error,
});

export const setAttendanceData = (data) => ({
  type: SET_ATTENDANCE_DATA,
  payload: data,
});

export const setPendingTasksData = (data) => ({
  type: SET_PENDINGTASKS_DATA,
  payload: data,
});

// Thunks
export const fetchDashboardData = (token, user) => async (dispatch) => {
  dispatch(fetchDashboardDataRequest());

  try {
    const data = {
      user
    }
    const response = await apiCall('dashboard/', token, 'POST', data);
    dispatch(fetchDashboardDataSuccess(response));
  } catch (error) {
    // const status = error?.response?.status;

    // // If token is expired or invalid (401 or 403)
    // if (status === 401 || status === 403) {
    //   // Remove the expired token from localStorage to prevent further use
    //   localStorage.removeItem('token');

    //   // Redirect to login page
    //   window.location.href = '/login'; // Force redirect to login
    // } else {

    // }
    console.log(error, "ERROR")
    // dispatch(fetchDashboardDataFailure('Failed to fetch dashboard data'));
  }
};

export const fetchAttendanceData = (token, role, userId) => async (dispatch) => {
  try {
    let data;
    if (role === 'Admin') {
      data = {
        userId: null
      }
    } else {
      data = {
        userId: userId
      }
    }
    const attendanceResponse = await apiCall('attendance/getTodayAllAttendanceData', token, 'POST', data);
    dispatch(setAttendanceData(attendanceResponse));
  } catch (error) {
    // const status = error?.response?.status;

    // // If token is expired or invalid (401 or 403)
    // if (status === 401 || status === 403) {
    //   // Remove the expired token from localStorage to prevent further use
    //   localStorage.removeItem('token');

    //   // Redirect to login page
    //   window.location.href = '/login'; // Force redirect to login
    // } else {
    console.error('Error while fetching attendance data' + error);
    dispatch(fetchDashboardDataFailure('Failed to fetch attendance data'));
    }
  // }
};

export const fetchPendingTasksData = (token, role, userId) => async (dispatch) => {
  try {
    const response = await apiCall('productivity/getalltasks', token, 'POST', null);
    const data = response.data;

    const todaysData = data.filter(item => item.status !== 'Completed' && item.status !== 'Done');

      dispatch(setPendingTasksData(todaysData));

  } catch (error) {
    // const status = error?.response?.status;

    // // If token is expired or invalid (401 or 403)
    // if (status === 401 || status === 403) {
    //   // Remove the expired token from localStorage to prevent further use
    //   localStorage.removeItem('token');

    //   // Redirect to login page
    //   window.location.href = '/login'; // Force redirect to login
    // } else {
    console.log(error, "ERROR")
    console.error('Error while fetching pending tasks data', error);
    // }
  }
};