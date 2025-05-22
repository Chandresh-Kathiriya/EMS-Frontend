import { apiCall } from "../../Components/API";

export const FETCH_ATTENDANCE_REPORT = 'FETCH_ATTENDANCE_REPORT';
export const SET_ATTENDANCE_REPORT_DATA = 'SET_ATTENDANCE_REPORT_DATA';
export const FETCH_USER = 'FETCH_USER';
export const SET_USER_DATA = 'SET_USER_DATA';
export const FETCH_WEEK_OFF = 'FETCH_WEEK_OFF';
export const SET_WEEK_OFF_DATA = 'SET_WEEK_OFF_DATA';
export const FETCH_HOLIDAY = 'FETCH_HOLIDAY';
export const SET_HOLIDAY_DATA = 'SET_HOLIDAY_DATA';
export const FETCH_LEAVE = 'FETCH_LEAVE';
export const SET_LEAVE_DATA = 'SET_LEAVE_DATA';

// Action to set ATTENDANCE data
export const setAttendanceReportData = (data) => ({
  type: SET_ATTENDANCE_REPORT_DATA,
  payload: data,
});

export const setUserData = (data) => ({
  type: SET_USER_DATA,
  payload: data,
});

export const setWeekOffData = (data) => ({
  type: SET_WEEK_OFF_DATA,
  payload: data,
});

export const setHolidayData = (data) => ({
  type: SET_HOLIDAY_DATA,
  payload: data,
});

export const setLeaveData = (data) => ({
  type: SET_LEAVE_DATA,
  payload: data,
});

// Thunk to fetch ATTENDANCE data
export const fetchAttendanceReportData = (token, month, year) => async (dispatch) => {
  try {
    const data = {
      month,
      year,
    };

    // Make the API call
    let attendanceReportResponse = await apiCall('attendance/getMonthAttendanceData', token, 'POST', data);

    // Dispatch the fetched data
    dispatch(setAttendanceReportData(attendanceReportResponse));

  } catch (error) {
    console.error('Error fetching Attendance Report Data:', {
      error: error.message,

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

export const fetchWeekOffData = (token) => async (dispatch) => {
  try {
    // Make the API call
    let weekOffResponse = await apiCall('master/getWeekOff', token, 'POST', null);
    // console.log(weekOffResponse)

    // Dispatch the fetched data
    dispatch(setWeekOffData(weekOffResponse));

  } catch (error) {
    const status = error?.response?.status;

    if (status === 401 || status === 403) {
      localStorage.removeItem('token');

      window.location.href = '/login'; // Force redirect to login
    } else {
      console.error('Error fetching week off Data:', {
        error: error.message,
      });
    }
  }
};

export const fetchHolidayData = (token, selectedMonth, selectedYear) => async (dispatch) => {
  try {
    // Make the API call
    const data = {
      month: selectedMonth,
      year: selectedYear
    }

    let holidayResponse = await apiCall('master/getHolidays', token, 'POST', data);

    // Dispatch the fetched data
    dispatch(setHolidayData(holidayResponse));

  } catch (error) {
    const status = error?.response?.status;

    if (status === 401 || status === 403) {
      localStorage.removeItem('token');

      window.location.href = '/login'; // Force redirect to login
    } else {
      console.error('Error fetching Holiday Data:', {
        error: error.message,
      });
    }
  }
};

export const fetchLeaveData = (token, selectedMonth, selectedYear) => async (dispatch) => {
  try {
    // Make the API call
    const data = {
      month: selectedMonth,
      year: selectedYear
    }

    let leaveResponse = await apiCall('leave/getLeaveData', token, 'POST', data);

    dispatch(setLeaveData(leaveResponse));

  } catch (error) {
    const status = error?.response?.status;

    if (status === 401 || status === 403) {
      localStorage.removeItem('token');

      window.location.href = '/login'; // Force redirect to login
    } else {
      console.error('Error fetching Leave Data:', {
        error: error.message,
      });
    }
  }
};