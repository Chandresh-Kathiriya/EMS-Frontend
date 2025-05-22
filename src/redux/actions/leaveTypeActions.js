import { apiCall } from "../../Components/API";

export const FETCH_LEAVE_TYPE = 'FETCH_LEAVE_TYPE';
export const SET_LEAVE_TYPE_DATA = 'SET_LEAVE_TYPE_DATA';

export const setLeaveTypeData = (data) => ({
  type: SET_LEAVE_TYPE_DATA,
  payload: data,
});

export const fetchLeaveTypeData = (token, per_page, page, status) => async (dispatch) => {
  try {
    const data = {
      per_page,
      page,
      status,
    }
    let leaveTypeResponse;
    leaveTypeResponse = await apiCall(`leave/getLeaveTypeData`, token, 'POST', data);

    dispatch(setLeaveTypeData(leaveTypeResponse));

  } catch (error) {
    const status = error?.response?.status;

    if (status === 401 || status === 403) {
      localStorage.removeItem('token');

      window.location.href = '/login'; // Force redirect to login
    } else {
      console.error('Error fetching Leave:', {
        error: error.message,
        page: page,
        per_page: per_page
      });
    }
  }
};