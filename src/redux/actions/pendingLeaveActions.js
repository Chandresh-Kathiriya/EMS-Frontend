import { apiCall } from "../../Components/API";

export const FETCH_PENDING_LEAVE = 'FETCH_PENDING_LEAVE';
export const SET_PENDING_LEAVE_DATA = 'SET_PENDING_LEAVE_DATA';
export const FETCH_USER = 'FETCH_USER';
export const FETCH_LEAVE_TYPE = 'FETCH_LEAVE_TYPE';

// Action to set pending leave data
export const setPendingLeaveData = (data) => ({
  type: SET_PENDING_LEAVE_DATA,
  payload: data,
});

// Thunk to fetch pending leave data
export const fetchPendingLeaveData = (token, params) => async (dispatch) => {
  try {
    const data = {
      per_page: params.per_page,
      page: params.page,
      status: 'pending',
      user: params.user,
      leaveType: params.leaveType,
      dateFrom: params.dateFrom,
      dateTo: params.dateTo
    };

    // Make the API call
    let pendingLeaveResponse = await apiCall('leave/getLeaveData', token, 'POST', data);

    // Dispatch the fetched data
    dispatch(setPendingLeaveData(pendingLeaveResponse)); // Assuming `data` is the relevant response property

  } catch (error) {
    const status = error?.response?.status;

    if (status === 401 || status === 403) {
      localStorage.removeItem('token');

      window.location.href = '/login'; // Force redirect to login
    } else {
      console.error('Error fetching Pending Leaves:', {
        error: error.message,
        page: params.page,
        per_page: params.per_page,
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

export const fetchLeaveTypeData = (token) => async (dispatch) => {
  try {

    let leaveTypeResponse;
    leaveTypeResponse = await apiCall(`leave/getLeaveTypeData`, token, 'POST', null);

    dispatch({ type: FETCH_LEAVE_TYPE, payload: leaveTypeResponse });

  } catch (error) {
    const status = error?.response?.status;

    if (status === 401 || status === 403) {
      localStorage.removeItem('token');

      window.location.href = '/login'; // Force redirect to login
    } else {
      console.error('Error fetching Leave:', {
        error: error.message,
      });
    }
  }
};