import {createStore, applyMiddleware, compose} from "redux";
import {createLogger} from 'redux-logger';
import rootReducer from './reducer';

const loggerMiddleware = createLogger();
const middleware = [];

// For redux Dev tools
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

function ConfigureStore(preloadedState) {
    return createStore(
        rootReducer,
        preloadedState,
        composeEnhancers(applyMiddleware(...middleware,loggerMiddleware))
    )
}

export default ConfigureStore;