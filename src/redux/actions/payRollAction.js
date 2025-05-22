import { apiCall } from "../../Components/API";

export const FETCH_PAY_ROLL = 'FETCH_PAY_ROLL';
export const SET_PAY_ROLL_DATA = 'SET_PAY_ROLL_DATA';
export const FETCH_USER = 'FETCH_USER';
export const SET_USER_DATA = 'SET_USER_DATA';
export const SET_FIRE_CRON = 'SET_FIRE_CRON';

export const setPayRollData = (data) => ({
  type: SET_PAY_ROLL_DATA,
  payload: data,
});

export const setFireCron = (data) => ({
  type: SET_FIRE_CRON,
  payload: data,
});

export const setUserData = (data) => ({
  type: SET_USER_DATA,
  payload: data,
});

export const fireCronManually = () => async (dispatch) => {
  try {

    const fireCronManually = await apiCall('trigger-payroll', null, 'POST', null);

    dispatch(setFireCron(fireCronManually));

  } catch (error) {
    console.log(error)
  }
}

export const fetchPayRollData = (token, params) => async (dispatch) => {
  try {
    const data = {
      ...params
    }
    const payRollResponse = await apiCall('master/getPayRoll', token, 'POST', data);

    dispatch(setPayRollData(payRollResponse));

  } catch (error) {
    console.log(error)
    const status = error?.response?.status;

    if (status === 401 || status === 403) {
      localStorage.removeItem('token');

      window.location.href = '/login'; // Force redirect to login
    } else {
      console.error('Error fetching Pay Roll data:', {
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

export const updateStatus = (token, data) => async (dispatch) => {
  try {
    // Make the API call
    let updateStatusPayRoll = await apiCall('master/updateStatusPayRoll', token, 'POST', data);

    // // Dispatch the fetched data
    // dispatch(setUserData(userResponse));

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
}
