import { apiCall } from "../../Components/API";

export const FETCH_PROJECT_DETAILS = 'FETCH_PROJECT_DETAILS';
export const SET_PROJECT_DETAILS_DATA = 'SET_PROJECT_DETAILS_DATA';
export const FETCH_ALL_USER = 'FETCH_ALL_USER';
export const SET_ALL_USER_DATA = 'SET_ALL_USER_DATA';

export const setProjectDetailsData = (data) => ({
  type: SET_PROJECT_DETAILS_DATA,
  payload: data,
});

export const setAllUserData = (data) => ({
  type: SET_ALL_USER_DATA,
  payload: data,
});

export const fetchProjectDetailsData = (token, projectId) => async (dispatch) => {
  try {
    
    let projectDetailsResponse;
    projectDetailsResponse = await apiCall(`productivity/ProjectDetails/${projectId}`, token, 'GET', null);

    dispatch(setProjectDetailsData(projectDetailsResponse));

  } catch (error) {
    console.error('Error fetching Project Details:', {
      error: error.message,
    });
  }
};

export const fetchAllUserData = (token) => async (dispatch) => {
  try {
    
    let allUserResponse;
    allUserResponse = await apiCall(`users/getAllUsersForAttendanceReport` , token, 'POST', null);

    dispatch(setAllUserData(allUserResponse.data));

  } catch (error) {
    console.error('Error fetching Users:', {
      error: error.message,
    });
  }
};