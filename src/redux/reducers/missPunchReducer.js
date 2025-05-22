import {
  SET_ATTENDANCE_DATA,
  SET_USER_DATA
} from '../actions/missPunchActions'

const initialState = {
  role: null,
  loading: false,
  error: null,
  attendanceData: [],
  userData: [],
};

const missPunchReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_ATTENDANCE_DATA:
      return { ...state, attendanceData: action.payload };
    case SET_USER_DATA:
      return { ...state, userData: action.payload };
    default:
      return state;
  }
};

export default missPunchReducer