import { apiCall } from "../../Components/API";

export const FETCH_LEAVE = 'FETCH_LEAVE';
export const SET_LEAVE_DATA = 'SET_LEAVE_DATA';
export const FETCH_LEAVE_TYPE = 'FETCH_LEAVE-TYPE';
export const SET_LEAVE_TYPE_DATA = 'SET_LEAVE_TYPE_DATA';

export const setLeaveData = (data) => ({
  type: SET_LEAVE_DATA,
  payload: data,
});

export const setLeaveTypeData = (data) => ({
  type: SET_LEAVE_TYPE_DATA,
  payload: data,
});

export const fetchLeaveData = (token, params) => async (dispatch) => {
  try {
    // Check if token exists and is not expired
    const data = {
      per_page: params.per_page,
      page: params.page,
      status: params.status,
      dateFrom: params.fromDate,
      dateTo: params.toDate,
    };

    const leaveResponse = await apiCall('leave/getLeaveData', token, 'POST', data);

    // If the API call is successful, dispatch the data
    dispatch(setLeaveData(leaveResponse));

  } catch (error) {
    const status = error?.response?.status;

    if (status === 401 || status === 403) {
      localStorage.removeItem('token');

      window.location.href = '/login'; // Force redirect to login
    } else {
      console.error('Error fetching Leave data:', {
        error: error.message,
        page: params.page,
        per_page: params.per_page,
      });
    }
  }
};


export const fetchLeaveTypeData = (token) => async (dispatch) => {
  try {

    let leaveTypeResponse;
    leaveTypeResponse = await apiCall(`leave/getLeaveTypeData`, token, 'POST', null);
    dispatch(setLeaveTypeData(leaveTypeResponse));

  } catch (error) {
    const status = error?.response?.status;

    if (status === 401 || status === 403) {
      localStorage.removeItem('token');

      window.location.href = '/login'; // Force redirect to login
    } else {
      console.error('Error fetching Leave Type:', {
        error: error.message,
      });
    }
  }
};