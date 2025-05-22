import { apiCall } from "../../Components/API";

export const FETCH_HOLIDAY = 'FETCH_HOLIDAY';
export const SET_HOLIDAY_DATA = 'SET_HOLIDAY_DATA';

// Action to set holiday data
export const setHolidayData = (data) => ({
  type: SET_HOLIDAY_DATA,
  payload: data,
});

// Thunk to fetch holiday data
export const fetchHolidayData = (token, params) => async (dispatch) => {
  try {
    const data = {
      per_page : params.per_page,
      page: params.page,
      fromDate: params.fromDate,
      toDate: params.toDate
    };

    // Make the API call
    let holidayResponse = await apiCall('master/getHolidays', token, 'POST', data);

    // Dispatch the fetched data
    dispatch(setHolidayData(holidayResponse)); // Assuming `data` is the relevant response property

  } catch (error) {
    const status = error?.response?.status;

    if (status === 401 || status === 403) {
      localStorage.removeItem('token');

      window.location.href = '/login'; // Force redirect to login
    } else {
    console.error('Error fetching Holiday:', {
      error: error.message,
      page: params.page,
      per_page: params.per_page,
    });
  }
  }
};