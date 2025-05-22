import {
  SET_PENDING_LEAVE_DATA,
  FETCH_USER,
  FETCH_LEAVE_TYPE
} from '../actions/pendingLeaveActions'

const initialState = {
  role: null,
  loading: false,
  error: null,
  pendingLeaveData: [],
  userData: [],
  leaveTypeData: []
};

const pendingLeaveReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_PENDING_LEAVE_DATA:
      return { ...state, pendingLeaveData: action.payload };
    case FETCH_USER:
      return { ...state, userData: action.payload };
    case FETCH_LEAVE_TYPE:
      return { ...state, leaveTypeData: action.payload };
    default:
      return state;
  }
};

export default pendingLeaveReducer