import { toast } from "react-toastify";
import { apiCall } from "../../Components/API";

export const FETCH_LOCATION_MASTER = 'FETCH_LOCATION_MASTER';
export const SET_LOCATION_MASTER = 'SET_LOCATION_MASTER';

// Action to set holiday data
export const setLocationMasterData = (data) => ({
  type: SET_LOCATION_MASTER,
  payload: data,
});

// Thunk to fetch holiday data
export const fetchLocationMasterData = (token, params) => async (dispatch) => {
  try {
    const data = {
      per_page : params.per_page,
      page: params.page,
    };

    // Make the API call
    let locationMasterResponse = await apiCall('master/getLocationMaster', token, 'POST', data);

    // Dispatch the fetched data
    dispatch(setLocationMasterData(locationMasterResponse)); // Assuming `data` is the relevant response property

  } catch (error) {
    const status = error?.response?.status;

    if (status === 401 || status === 403) {
      localStorage.removeItem('token');

      window.location.href = '/login'; 
    } else {
    console.error('Error fetching Location Master:', {
      error: error.message,
      page: params.page,
      per_page: params.per_page,
    });
  }
  }
};

export const editLocationMasterData = (token, data, params) => async (dispatch) => {
  try {

    const editLocationMaster = await apiCall('master/editLocationMaster', token, 'POST', data)
    if (editLocationMaster?.message === 'Location Master updated successfully!') {
      toast.success(editLocationMaster.message)
    } else {
      toast.error(editLocationMaster.message)
    }
    dispatch(fetchLocationMasterData(token, params))

  } catch (error) {
    const status = error?.response?.status;

    if (status === 401 || status === 403) {
      localStorage.removeItem('token');

      window.location.href = '/login'; 
    } else {
    console.error('Error editing Location Master:', {
      error: error.message,
    });
  }
  }
};

export const createLocationMasterData = (token, data, params) => async (dispatch) => {
  try {

    const createLocationMaster = await apiCall('master/createLocationMaster', token, 'POST', data)
    if (createLocationMaster?.message === 'Location Master created successfully!') {
      toast.success(createLocationMaster.message)
    } else {
      toast.error(createLocationMaster.message)
    }

    dispatch(fetchLocationMasterData(token, params))

  } catch (error) {
    const status = error?.response?.status;

    if (status === 401 || status === 403) {
      localStorage.removeItem('token');

      window.location.href = '/login'; 
    } else {
    console.error('Error creating Location Master:', {
      error: error.message,
    });
  }
  }
};

export const deleteLocationMaster = (token, params) => async (dispatch) => {
  try {

    const deleteLocationMaster = await apiCall('master/deleteLocationMaster', token, 'POST', params)
    if (deleteLocationMaster?.message === 'Location Master deleted successfully!') {
      toast.success(deleteLocationMaster.message)
    } else {
      toast.error(deleteLocationMaster.message)
    }

    dispatch(fetchLocationMasterData(token, params))

  } catch (error) {
    const status = error?.response?.status;

    if (status === 401 || status === 403) {
      localStorage.removeItem('token');

      window.location.href = '/login'; 
    } else {
    console.error('Error creating Location Master:', {
      error: error.message,
    });
  }
  }
};