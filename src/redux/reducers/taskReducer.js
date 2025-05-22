import {
  SET_TASK_DATA,
  SET_ALL_TASK_DATA,
  FETCH_USER,
  SET_PROJECT_DATA
} from '../actions/taskActions'

const initialState = {
  role: null,
  loading: false,
  error: null,
  taskData: [],
  allTaskData: [],
  userData: [],
  projectData: []
};

const taskReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_TASK_DATA:
      return { ...state, taskData: action.payload };
    case SET_ALL_TASK_DATA:
      return { ...state, allTaskData: action.payload };
    case SET_PROJECT_DATA:
      return { ...state, projectData: action.payload };
    case FETCH_USER:
      return { ...state, userData: action.payload };
    default:
      return state;
  }
};

export default taskReducer