import {
  SET_LEAVE_DATA,
  SET_LEAVE_TYPE_DATA,
} from '../actions/leaveActions'

const initialState = {
  role: null,
  loading: false,
  error: null,
  leaveData: [],
  leaveTypeData: []
};

const leaveReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_LEAVE_DATA:
      return { ...state, leaveData: action.payload };
    case SET_LEAVE_TYPE_DATA:
      return { ...state, leaveTypeData: action.payload };
    default:
      return state;
  }
};

export default leaveReducer