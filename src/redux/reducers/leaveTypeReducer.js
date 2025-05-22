import {
  SET_LEAVE_TYPE_DATA,
} from '../actions/leaveTypeActions'

const initialState = {
  role: null,
  loading: false,
  error: null,
  leaveTypeData: [],
};

const leaveTypeReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_LEAVE_TYPE_DATA:
      return { ...state, leaveTypeData: action.payload };
    default:
      return state;
  }
};

export default leaveTypeReducer