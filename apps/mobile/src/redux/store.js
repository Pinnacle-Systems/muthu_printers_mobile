import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import LOGINSLICE from "./slice/LoginRtk";




const StorageConfig =configureStore({
    reducer : {
        [LOGINSLICE.reducerPath] :LOGINSLICE.reducer
    },
    middleware : (defaultmidlewhare)=> defaultmidlewhare().concat([LOGINSLICE?.middleware])
})

setupListeners(StorageConfig)