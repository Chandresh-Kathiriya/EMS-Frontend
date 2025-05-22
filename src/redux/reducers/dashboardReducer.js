// src/redux/reducers/dashboardReducer.js

import {
  FETCH_DASHBOARD_DATA_REQUEST,
  FETCH_DASHBOARD_DATA_SUCCESS,
  FETCH_DASHBOARD_DATA_FAILURE,
  SET_ATTENDANCE_DATA,
  SET_PENDINGTASKS_DATA
} from '../actions/dashboardActions';

const initialState = {
  role: null,
  totalProjects: 0,
  ongoingTasks: 0,
  dueTodayTasks: 0,
  overdueTasks: 0,
  loading: false,
  error: null,
  attendanceData: [],
  pendingTasksData: [],
};

const dashboardReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_DASHBOARD_DATA_REQUEST:
      return { ...state, loading: true };
      
    case FETCH_DASHBOARD_DATA_SUCCESS:
      // Ensure action.payload has the expected fields before updating state
      return {
        ...state,
        loading: false,
        error: null,
        totalProjects: action.payload?.totalProjects || 0,
        ongoingTasks: action.payload?.ongoingTasks || 0,
        dueTodayTasks: action.payload?.dueTodayTasks || 0,
        overdueTasks: action.payload?.overdueTasks || 0,
      };
      
    case FETCH_DASHBOARD_DATA_FAILURE:
      return { ...state, error: action.payload, loading: false };

    case SET_ATTENDANCE_DATA:
      return { ...state, attendanceData: action.payload  };

    case SET_PENDINGTASKS_DATA:
      return { ...state, pendingTasksData: action.payload };

    default:
      return state;
  }
};

export default dashboardReducer;
