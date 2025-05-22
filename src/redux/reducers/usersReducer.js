import {
  SET_USERS_DATA,
  SET_ROLES_DATA,
  SET_REPORTING_MANAGER_DATA,
  SET_WEEK_OFF_DATA
} from '../actions/usersActions'

const initialState = {
  role: null,
  loading: false,
  error: null,
  usersData: [],
  rolesData: [],
  reportingManager: [],
  weekOffData: []
};

const usersReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_USERS_DATA:
      return { ...state, usersData: action.payload };
    case SET_REPORTING_MANAGER_DATA:
      return { ...state, reportingManager: action.payload };
    case SET_ROLES_DATA:
      return { ...state, rolesData: action.payload };
    case SET_WEEK_OFF_DATA:
      return { ...state, weekOffData: action.payload };
    default:
      return state;
  }
};

export default usersReducer