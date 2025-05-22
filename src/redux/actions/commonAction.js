import { apiCall } from "../../Components/API";

export const FETCH_PERMISSION = 'FETCH_PERMISSION';
export const SET_PERMISSION_DATA = 'SET_PERMISSION_DATA';
export const SET_PUNCH_DATA = 'SET_PUNCH_DATA';
export const SET_SMTP_DATA = 'SET_SMTP_DATA';
export const SET_LOCATION_MASTER_DATA = 'SET_LOCATION_MASTER_DATA';
export const SET_LOADING_PERMISSIONS = 'SET_LOADING_PERMISSIONS';

// Action to set PERMISSION data
export const setPermissionData = (data) => ({
  type: SET_PERMISSION_DATA,
  payload: data,
});
export const setPunchData = (data) => ({
  type: SET_PUNCH_DATA,
  payload: data,
});
export const setSMTPData = (data) => ({
  type: SET_SMTP_DATA,
  payload: data,
});
export const setLocationMasterData = (data) => ({
  type: SET_LOCATION_MASTER_DATA,
  payload: data,
});
export const setLoadingPermissions = (isLoading) => ({
  type: SET_LOADING_PERMISSIONS,
  payload: isLoading,
});

// Thunk to fetch PERMISSION data
export const fetchPermissionData = (token) => async (dispatch) => {
  try {
    dispatch(setLoadingPermissions(true));

    const permissionResponse = await apiCall('common/getPermission', token, 'POST', null);

    dispatch(setPermissionData(permissionResponse.permission));
    dispatch(setPunchData(permissionResponse.punchPermission));
    dispatch(setSMTPData(permissionResponse.smtpPermission));
    dispatch(setLocationMasterData(permissionResponse.locationMasterPermission));
  } catch (error) {
    if (error.response && error.response.status === 401) {
      // Clear auth info and redirect
      localStorage.removeItem('token'); // or wherever you store it
      window.location.href = '/login';
      dispatch(setLoadingPermissions(false))
    }

    console.error('Error fetching Permission:', error.message);
  } finally {
    dispatch(setLoadingPermissions(false));
  }
};
