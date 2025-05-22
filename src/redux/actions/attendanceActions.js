import { apiCall } from "../../Components/API";

export const FETCH_ATTENDANCE = 'FETCH_ATTENDANCE';
export const SET_ATTENDANCE_DATA = 'SET_ATTENDANCE_DATA';
export const FETCH_USER = 'FETCH_USER';
export const SET_USER_DATA = 'SET_USER_DATA';
export const SET_EXPORT_ATTENDANCE_DATA = 'SET_EXPORT_ATTENDANCE_DATA';

// Action to set ATTENDANCE data
export const setAttendanceData = (data) => ({
  type: SET_ATTENDANCE_DATA,
  payload: data,
});

export const setExportAttendanceData = (data) => ({
  type: SET_EXPORT_ATTENDANCE_DATA,
  payload: data,
});

// Action to set USER data
export const setUserData = (data) => ({
  type: SET_USER_DATA,
  payload: data,
});

// Thunk to fetch ATTENDANCE data
export const fetchAttendanceData = (token, params) => async (dispatch) => {
  try {
    const data = {
      per_page: params.per_page,
      page: params.page,
      userId: params.user,
      filterUser: params.filterUser,
      fromDate: params.fromDate,
      toDate: params.toDate
    };

    // Make the API call
    let attendanceResponse = await apiCall('attendance/getAttendanceData', token, 'POST', data);

    // Dispatch the fetched data
    dispatch(setAttendanceData(attendanceResponse)); // Assuming `data` is the relevant response property

  } catch (error) {
    const status = error?.response?.status;

    if (status === 401 || status === 403) {
      localStorage.removeItem('token');

      window.location.href = '/login'; // Force redirect to login
    } else {
      console.error('Error fetching Attendance:', {
        error: error.message,
        page: params.page,
        per_page: params.per_page,
      });
    }
  }
};

export const fetchExportAttendanceData = (token, params) => async (dispatch) => {
  try {
    const data = {
      userId: params.user,
      filterUser: params.filterUser,
      fromDate: params.fromDate,
      toDate: params.toDate
    };

    // Make the API call
    let attendanceResponse = await apiCall('attendance/getExportAttendanceData', token, 'POST', data);

    // Dispatch the fetched data
    dispatch(setExportAttendanceData(attendanceResponse)); // Assuming `data` is the relevant response property

  } catch (error) {
    const status = error?.response?.status;

    if (status === 401 || status === 403) {
      localStorage.removeItem('token');

      window.location.href = '/login'; // Force redirect to login
    } else {
      console.error('Error fetching Attendance:', {
        error: error.message,
      });
    }
  }
};



export const fetchUserData = (token) => async (dispatch) => {
  try {
    // Make the API call
    let userResponse = await apiCall('users/getAllUsersForAttendanceReport', token, 'POST', null);

    // // Dispatch the fetched data
    dispatch(setUserData(userResponse));

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