import {
  SET_PROJECT_DATA,
} from '../actions/projectActions'

const initialState = {
  role: null,
  loading: false,
  error: null,
  projectData: [],
};

const projectReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_PROJECT_DATA:
      return { ...state, projectData: action.payload };
    // case FETCH_PROJECT_DATA_SUCCESS:
    //   return { ...state, projects: action.payload, loading: false };
    // case FETCH_PROJECT_DATA_FAILURE:
    //   return { ...state, error: action.payload, loading: false };
    default:
      return state;
  }
};

export default projectReducer