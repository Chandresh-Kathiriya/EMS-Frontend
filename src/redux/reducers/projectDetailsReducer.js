import {
  SET_PROJECT_DETAILS_DATA,
  SET_ALL_USER_DATA,
} from '../actions/projectDetailsActions'

const initialState = {
  role: null,
  loading: false,
  error: null,
  projectDetailsData: [],
  allUserData: [],
};

const projectDetailsReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_PROJECT_DETAILS_DATA:
      return { ...state, projectDetailsData: action.payload };
    case SET_ALL_USER_DATA:
      return { ...state, allUserData: action.payload };
    default:
      return state;
  }
};

export default projectDetailsReducer