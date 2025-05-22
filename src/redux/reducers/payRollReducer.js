import {
  SET_PAY_ROLL_DATA,
  SET_USER_DATA,
  SET_FIRE_CRON
} from '../actions/payRollAction'

const initialState = {
  role: null,
  loading: false,
  error: null,
  payRollData: [],
  userData: [],
  fireCron: []
};

const payRollReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_PAY_ROLL_DATA:
      return { ...state, payRollData: action.payload };
    case SET_USER_DATA:
      return { ...state, userData: action.payload };
    case SET_FIRE_CRON:
      return { ...state, fireCron: action.payload };
    default:
      return state;
  }
};

export default payRollReducer