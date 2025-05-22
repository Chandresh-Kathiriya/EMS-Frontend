import { toast } from "react-toastify";
import { apiCall } from "../../Components/API";

export const FETCH_USER_SALARY = 'FETCH_USER_SALARY';
export const SET_USER_SALARY_DATA = 'SET_USER_SALARY_DATA';
export const FETCH_USER = 'FETCH_USER';
export const SET_USER_DATA = 'SET_USER_DATA';

export const setUserSalaryData = (data) => ({
  type: SET_USER_SALARY_DATA,
  payload: data,
});

export const setUserData = (data) => ({
  type: SET_USER_DATA,
  payload: data,
});

export const fetchUserSalaryData = (token, params) => async (dispatch) => {
  try {
    const data = {
      ...params,
    };
    let userSalaryResponse = await apiCall('master/getUserSalary', token, 'POST', data);

    dispatch(setUserSalaryData(userSalaryResponse));

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

export const fetchUserData = (token) => async (dispatch) => {
  try {
    let userResponse = await apiCall('users/getAllUsersForAttendanceReport', token, 'POST', null);

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

export const createUserSalary = (token, payload) => async (dispatch) => {
  try {
    let createUserSalary = await apiCall('master/createUserSalary', token, 'POST', payload);
    if (createUserSalary?.success === true) {
      toast.success(createUserSalary.message)
      const paginationData = {
        page : payload.page,
        per_page : payload.per_page
      }
      await dispatch(fetchUserSalaryData(token, paginationData));
    } else {
      toast.error(createUserSalary.message)
    }

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

export const editUserSalary = (token, payload) => async (dispatch) => {
  try {
    let editUserSalary = await apiCall('master/editUserSalary', token, 'POST', payload);
    if (editUserSalary?.success === true) {
      toast.success(editUserSalary.message)
      const paginationData = {
        page : payload.page,
        per_page : payload.per_page
      }
      await dispatch(fetchUserSalaryData(token, paginationData));
    } else {
      toast.error(editUserSalary.message)
    }

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

export const deleteUserSalary = (token, payload) => async (dispatch) => {
  try {
    let deleteUserSalary = await apiCall('master/deleteUserSalary', token, 'POST', payload);
    if (deleteUserSalary?.success === true) {
      toast.success(deleteUserSalary.message)
      const paginationData = {
        page : payload.page,
        per_page : payload.per_page
      }
      await dispatch(fetchUserSalaryData(token, paginationData));
    } else {
      toast.error(deleteUserSalary.message)
    }

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