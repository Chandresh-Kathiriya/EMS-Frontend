import { apiCall } from "../../Components/API";

export const FETCH_WEEKOFF = 'FETCH_WEEKOFF';
export const SET_WEEKOFF_DATA = 'SET_WEEKOFF_DATA';

// Action to set users data
export const setWeekOffData = (data) => ({
  type: SET_WEEKOFF_DATA,
  payload: data,
});

// Thunk to fetch users data
export const fetchWeekOffData = (token, params) => async (dispatch) => {
  try {
    const data = {
      per_page: params.per_page,
      page: params.page,
      fromDate: params.fromDate,
      toDate: params.toDate
    };

    // Make the API call
    let weekOffResponse = await apiCall('master/getWeekOff', token, 'POST', data);

    // Dispatch the fetched data
    dispatch(setWeekOffData(weekOffResponse));

  } catch (error) {
    const status = error?.response?.status;

    if (status === 401 || status === 403) {
      localStorage.removeItem('token');

      window.location.href = '/login'; // Force redirect to login
    } else {
      console.error('Error fetching Week Off:', {
        error: error.message,
        page: params.page,
        per_page: params.per_page,
      });
    }
  }
};