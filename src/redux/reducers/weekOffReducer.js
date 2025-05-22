import {
  SET_WEEKOFF_DATA,
} from '../actions/weekOffActions'

const initialState = {
  role: null,
  loading: false,
  error: null,
  weekOffData: [],
};

const weekOffReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_WEEKOFF_DATA:
      return { ...state, weekOffData: action.payload };
    default:
      return state;
  }
};

export default weekOffReducer