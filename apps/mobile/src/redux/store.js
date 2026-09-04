import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import LOGINSLICE from "./api/LoginRtk";
import DEPARTMENT_API from "./api/department";
import JOBCARD_API from "./api/jobcard";
import PROGRESS_API from "./api/process";
import MACHINE_API from "./api/machine";

const appReducer = combineReducers({
  [LOGINSLICE.reducerPath]: LOGINSLICE.reducer,
  [DEPARTMENT_API.reducerPath]: DEPARTMENT_API.reducer,
  [JOBCARD_API.reducerPath]: JOBCARD_API.reducer,
  [PROGRESS_API.reducerPath]: PROGRESS_API.reducer,
  [MACHINE_API.reducerPath]: MACHINE_API.reducer,
});

const rootReducer = (state, action) => {
  if (action.type === "USER_LOGOUT") {
    state = undefined;
  }
  return appReducer(state, action);
};

export const StorageConfig = configureStore({
  reducer: rootReducer,
  middleware: (defaultMiddleware) =>
    defaultMiddleware().concat([
      LOGINSLICE?.middleware,
      DEPARTMENT_API.middleware,
      JOBCARD_API.middleware,
      PROGRESS_API.middleware,
      MACHINE_API.middleware,
    ]),
});

setupListeners(StorageConfig.dispatch);
