import { apiCall } from "../../Components/API";

export const FETCH_USERS = 'FETCH_UESRS';
export const SET_USERS_DATA = 'SET_USERS_DATA';
export const FETCH_REPORTING_MANAGER = 'FETCH_REPORTING_MANAGER';
export const SET_REPORTING_MANAGER_DATA = 'SET_REPORTING_MANAGER_DATA';
export const FETCH_ROLES = 'FETCH_ROLES';
export const SET_ROLES_DATA = 'SET_ROLES_DATA';
export const SET_WEEK_OFF_DATA = 'SET_WEEK_OFF_DATA';

// Action to set users data
export const setUsersData = (data) => ({
  type: SET_USERS_DATA,
  payload: data,
});
export const setReportingManager = (data) => ({
  type: SET_REPORTING_MANAGER_DATA,
  payload: data,
});

export const setWeekOff = (data) => ({
  type: SET_WEEK_OFF_DATA,
  payload: data,
});

export const setRoles = (data) => ({
  type: SET_ROLES_DATA,
  payload: data,
});

// Thunk to fetch users data
export const fetchUsersData = (token, per_page, page, user, filterParams) => async (dispatch) => {
  try {
    const data = {
      per_page,
      page,
      user,
      filterParams
    };

    // Make the API call
    let usersResponse = await apiCall('users/getAllUsers', token, 'POST', data);

    // Dispatch the fetched data
    dispatch(setUsersData(usersResponse)); // Assuming `data` is the relevant response property

  } catch (error) {
    const status = error?.response?.status;

    if (status === 401 || status === 403) {
      localStorage.removeItem('token');

      window.location.href = '/login'; // Force redirect to login
    } else {
      console.error('Error fetching Users:', {
        error: error.message,
        page: page,
        per_page: per_page,
      });
    }
  }
};

export const fetchRoles = (token) => async (dispatch) => {
  try {
    // Make the API call
    let rolesResponse = await apiCall('users/getRoles', token, 'POST', null);

    // Dispatch the fetched data
    dispatch(setRoles(rolesResponse)); // Assuming `data` is the relevant response property

  } catch (error) {
    const status = error?.response?.status;

    if (status === 401 || status === 403) {
      localStorage.removeItem('token');

      window.location.href = '/login'; // Force redirect to login
    } else {
      console.error('Error fetching Roles:', {
        error: error.message,
      });
    }
  }
};

export const fetchReportingManagerData = (token) => async (dispatch) => {
  try {
    // Make the API call
    let reportingManagerResponse = await apiCall('users/getAllUsersForAttendanceReport', token, 'POST', null);

    // // Dispatch the fetched data
    dispatch(setReportingManager(reportingManagerResponse));

  } catch (error) {
    const status = error?.response?.status;

    if (status === 401 || status === 403) {
      localStorage.removeItem('token');

      window.location.href = '/login'; // Force redirect to login
    } else {
      console.error('Error fetching Reporting Manager Data:', {
        error: error.message,
      });
    }
  }
};

export const fetchWeekOffData = (token) => async (dispatch) => {
  try {
    // Make the API call
    let weekOffResponse = await apiCall('master/getAllWeekOff', token, 'POST', null);

    // // Dispatch the fetched data
    dispatch(setWeekOff(weekOffResponse));

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