import { apiCall } from "../../Components/API";

export const FETCH_REGULARIZATION = 'FETCH_REGULARIZATION';
export const SET_REGULARIZATION_DATA = 'SET_REGULARIZATION_DATA';
export const FETCH_USER = 'FETCH_USER';
export const SET_USER_DATA = 'SET_USER_DATA';

export const setRegularizationData = (data) => ({
  type: SET_REGULARIZATION_DATA,
  payload: data,
});

export const setUserData = (data) => ({
  type: SET_USER_DATA,
  payload: data,
});

export const fetchRegularizationData = (token, per_page, page, filterParams) => async (dispatch) => {
  try {
    const data = {
      per_page,
      page,
      user: filterParams?.user,
      status: filterParams?.status,
      fromDate: filterParams?.fromDate,
      toDate: filterParams?.toDate
    }
    let regularizationResponse;
    regularizationResponse = await apiCall(`attendance/getRegularizationData`, token, 'POST', data);

    dispatch(setRegularizationData(regularizationResponse));

  } catch (error) {
    const status = error?.response?.status;

    if (status === 401 || status === 403) {
      localStorage.removeItem('token');

      window.location.href = '/login'; // Force redirect to login
    } else {
      console.error('Error fetching Regularization:', {
        error: error.message,
        page: page,
        per_page: per_page
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