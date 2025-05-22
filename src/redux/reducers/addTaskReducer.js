import {
  SET_TASK_DATA,
  SET_PROJECT_DATA,
  SET_ASSIGNEE_DATA,
  SET_TASK_ALL_DATA,
  SET_ALL_USER
} from '../actions/addTaskAction'

const initialState = {
  role: null,
  loading: false,
  error: null,
  taskData: [],
  projectData: [],
  assigneeData: [],
  taskAllData: [],
  allUser: []
};

const addTaskReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_TASK_DATA:
      return { ...state, taskData: action.payload };
    case SET_PROJECT_DATA:
      return { ...state, projectData: action.payload };
    case SET_ASSIGNEE_DATA:
      return { ...state, assigneeData: action.payload };
    case SET_TASK_ALL_DATA:
      return { ...state, taskAllData: action.payload };
    case SET_ALL_USER:
      return { ...state, allUser: action.payload };
    default:
      return state;
  }
};

export default addTaskReducer