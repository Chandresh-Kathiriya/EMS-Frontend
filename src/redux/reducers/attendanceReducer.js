import {
  SET_ATTENDANCE_DATA,
  SET_USER_DATA,
  SET_EXPORT_ATTENDANCE_DATA
} from '../actions/attendanceActions'

const initialState = {
  role: null,
  loading: false,
  error: null,
  attendanceData: [],
  userData: [],
  exportAttendance: []
};

const attendanceReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_ATTENDANCE_DATA:
      return { ...state, attendanceData: action.payload };
    case SET_USER_DATA:
      return { ...state, userData: action.payload };
    case SET_EXPORT_ATTENDANCE_DATA:
      return { ...state, exportAttendance: action.payload };
    default:
      return state;
  }
};

export default attendanceReducer