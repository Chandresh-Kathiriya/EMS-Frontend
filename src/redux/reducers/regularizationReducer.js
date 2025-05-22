import {
  SET_REGULARIZATION_DATA,
  SET_USER_DATA
} from '../actions/regularizationActions'

const initialState = {
  role: null,
  loading: false,
  error: null,
  regularizationData: [],
  userData: [],
};

const regularizationReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_REGULARIZATION_DATA:
      return { ...state, regularizationData: action.payload };
    case SET_USER_DATA:
      return { ...state, userData: action.payload };
    // case FETCH_PROJECT_DATA_FAILURE:
    //   return { ...state, error: action.payload, loading: false };
    default:
      return state;
  }
};

export default regularizationReducer