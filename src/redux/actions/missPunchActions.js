import { apiCall } from "../../Components/API";

export const FETCH_ATTENDANCE = 'FETCH_ATTENDANCE';
export const SET_ATTENDANCE_DATA = 'SET_ATTENDANCE_DATA';
export const FETCH_USER = 'FETCH_USER';
export const SET_USER_DATA = 'SET_USER_DATA';

// Action to set ATTENDANCE data
export const setAttendanceData = (data) => ({
  type: SET_ATTENDANCE_DATA,
  payload: data,
});

export const setUserData = (data) => ({
  type: SET_USER_DATA,
  payload: data,
});

// Thunk to fetch ATTENDANCE data
export const fetchAttendanceData = (token, params) => async (dispatch) => {
  try {
    const data = {
      per_page :  params.per_page,
      page:  params.page,
      userId: params.dataUser,
      filterUser: params.filterUser,
      fromDate: params.fromDate,
      toDate: params.toDate
    };

    // Make the API call
    let attendanceResponse = await apiCall('attendance/getMissAttendanceData', token, 'POST', data);

    // Dispatch the fetched data
    dispatch(setAttendanceData(attendanceResponse)); 

  } catch (error) {
    console.error('Error fetching Miss Attendance:', {
      error: error.message,
      page: params.page,
      per_page: params.per_page,
    });
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