// src/redux/reducers/index.js

import { combineReducers } from 'redux';
import dashboardReducer from './dashboardReducer';
import taskTimerReducer from './taskTimerReducer';
import projectReducer from './projectReducer';
import taskReducer from './taskReducer';
import regularizationReducer from './regularizationReducer';
import leaveReducer from './leaveReducer';
import leaveTypeReducer from './leaveTypeReducer';
import pendingLeaveReducer from './pendingLeaveReducer';
import holidayReducer from './holidayReducer';
import usersReducer from './usersReducer';
import addTaskReducer from './addTaskReducer';
import attendanceReducer from './attendanceReducer';
import weekOffReducer from './weekOffReducer';
import attendanceReportReducer from './attendanceReportReducer';
import commonReducer from './commonReducer';
import projectDetailsReducer from './projectDetailsReducer';
import missPunchReducer from './missPunchReducer';
import locationMasterReducer from './locationMasterReducer';
import userSalaryReducer from './userSalaryReducer';
import payRollReducer from './payRollReducer';

const rootReducer = combineReducers({
  dashboard: dashboardReducer,
  taskTimer: taskTimerReducer,
  project: projectReducer,
  task: taskReducer,
  regularization: regularizationReducer,
  leave: leaveReducer,
  leaveType: leaveTypeReducer,
  pendingLeave: pendingLeaveReducer,
  holiday: holidayReducer,
  users: usersReducer,
  addTask: addTaskReducer,
  attendance: attendanceReducer,
  weekOff: weekOffReducer,
  attendanceReport: attendanceReportReducer,
  common: commonReducer,
  projectDetails: projectDetailsReducer,
  missPunch : missPunchReducer,
  locationMaster : locationMasterReducer,
  userSalary : userSalaryReducer,
  payRoll : payRollReducer
});

export default rootReducer;