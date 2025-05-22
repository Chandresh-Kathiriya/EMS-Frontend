import {
  SET_USER_SALARY_DATA,
  SET_USER_DATA,
} from '../actions/userSalaryAction'

const initialState = {
  role: null,
  loading: false,
  error: null,
  userData: [],
  userSalaryData: []
};

const userSalaryReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_USER_SALARY_DATA:
      return { ...state, userSalaryData: action.payload };
    case SET_USER_DATA:
      return { ...state, userData: action.payload };
    default:
      return state;
  }
};

export default userSalaryReducer