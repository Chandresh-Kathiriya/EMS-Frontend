import { FETCH_TASK_TIMER, FETCH_USER, FETCH_TASK } from '../actions/taskTimerActions';

const initialState = {
  taskTimer: [],
  users: [],
  task: [],
};

const taskReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_TASK_TIMER:
      return { ...state, taskTimer: action.payload };
    case FETCH_TASK:
      return { ...state, task: action.payload };
    case FETCH_USER:
      return { ...state, users: action.payload };
    default:
      return state;
  }
};

export default taskReducer;