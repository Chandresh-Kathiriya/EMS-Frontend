import { apiCall } from "../../Components/API";

export const FETCH_PROJECT = 'FETCH_PROJECT';
export const SET_PROJECT_DATA = 'SET_PROJECT_DATA';

export const setProjectData = (data) => ({
  type: SET_PROJECT_DATA,
  payload: data,
});

export const fetchProjectData = (token, per_page, page, user, status) => async (dispatch) => {
  try {
    const data = {
      per_page,
      page,
      status,
      user
    }
    let projectResponse;
    projectResponse = await apiCall(`productivity/project`, token, 'POST', data);

    await dispatch(setProjectData(projectResponse));

  } catch (error) {
    const status = error?.response?.status;

    if (status === 401 || status === 403) {
      localStorage.removeItem('token');

      window.location.href = '/login'; // Force redirect to login
    } else {
      console.error('Error fetching Projects:', {
        error: error.message,
        page: page,
        per_page: per_page
      });
    }
  }
};