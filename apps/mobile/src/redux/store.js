import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import LOGINSLICE from "./api/LoginRtk";
import DEPARTMENT_API from "./api/department";
import JOBCARD_API from "./api/jobcard";
import PROGRESS_API from "./api/process";




export const StorageConfig = configureStore({
    reducer : {
        [LOGINSLICE.reducerPath] :LOGINSLICE.reducer,
        [DEPARTMENT_API.reducerPath] : DEPARTMENT_API.reducer,
        [JOBCARD_API.reducerPath] : JOBCARD_API.reducer,
        [PROGRESS_API.reducerPath] : PROGRESS_API.reducer
    },
     middleware : (defaultmidlewhare)=> defaultmidlewhare().concat([LOGINSLICE?.middleware,DEPARTMENT_API.middleware,JOBCARD_API.middleware,PROGRESS_API.middleware])
})

setupListeners(StorageConfig.dispatch)