import {
  SET_ATTENDANCE_REPORT_DATA,
  SET_USER_DATA,
  SET_WEEK_OFF_DATA,
  SET_HOLIDAY_DATA,
  SET_LEAVE_DATA
} from '../actions/attendanceReportActions'

const initialState = {
  role: null,
  loading: false,
  error: null,
  attendanceReportData: [],
  userData: [],
  weekOffData: [],
  holidayData: [],
  leaveData: []
};

const attendanceReportReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_ATTENDANCE_REPORT_DATA:
      return { ...state, attendanceReportData: action.payload };
    case SET_USER_DATA:
      return { ...state, userData: action.payload };
    case SET_WEEK_OFF_DATA:
      return { ...state, weekOffData: action.payload };
    case SET_HOLIDAY_DATA:
      return { ...state, holidayData: action.payload };
    case SET_LEAVE_DATA:
      return { ...state, leaveData: action.payload };
    default:
      return state;
  }
};

export default attendanceReportReducer