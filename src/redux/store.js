import { createStore, applyMiddleware } from 'redux';
import {thunk} from 'redux-thunk'; // Correctly importing thunk
import rootReducer from './reducers'; // Import the rootReducer

// Create the Redux store with the rootReducer and apply the thunk middleware
const store = createStore(rootReducer, applyMiddleware(thunk));

export default store;