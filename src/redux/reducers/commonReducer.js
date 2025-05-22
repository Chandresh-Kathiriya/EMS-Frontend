import {
  SET_PERMISSION_DATA,
  SET_PUNCH_DATA,
  SET_SMTP_DATA,
  SET_LOCATION_MASTER_DATA,
  SET_LOADING_PERMISSIONS
} from '../actions/commonAction';

const initialState = {
  role: null,
  loadingPermissions: true,
  error: null,
  permissionData: [],
  punchData: [],
  smtpData: [],
  locationMaster: []
};

const permissionReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_LOADING_PERMISSIONS:
      return { ...state, loadingPermissions: action.payload };
    case SET_PERMISSION_DATA:
      return { ...state, permissionData: action.payload };
    case SET_PUNCH_DATA:
      return { ...state, punchData: action.payload };
    case SET_SMTP_DATA:
      return { ...state, smtpData: action.payload };
    case SET_LOCATION_MASTER_DATA:
      return { ...state, locationMaster: action.payload };
    default:
      return state;
  }
};

export default permissionReducer;
