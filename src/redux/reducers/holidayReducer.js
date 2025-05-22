import {
  SET_HOLIDAY_DATA,
} from '../actions/holidayActions'

const initialState = {
  role: null,
  loading: false,
  error: null,
  holidayData: [],
};

const holidayReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_HOLIDAY_DATA:
      return { ...state, holidayData: action.payload };
    default:
      return state;
  }
};

export default holidayReducer