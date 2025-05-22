import {
  SET_LOCATION_MASTER,
} from '../actions/locationMasterAction'

const initialState = {
  role: null,
  loading: false,
  error: null,
  locationMasterData: [],
};

const locationMasterReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_LOCATION_MASTER:
      return { ...state, locationMasterData: action.payload };
    default:
      return state;
  }
};

export default locationMasterReducer