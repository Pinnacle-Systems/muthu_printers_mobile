import { fetchBaseQuery } from "@reduxjs/toolkit/query";
import { APIURL } from "../../Utils/Storage/DotenvFinder";
import { SetHeader } from "./HeaderSet";

const CustomFetchBaseQuery = (BASE) => fetchBaseQuery({

    baseUrl : BASE ??  APIURL,
     prepareHeaders: async (headers) => {
             await SetHeader(headers)
             return headers
           }, timeout: 80000
        
    })

export default CustomFetchBaseQuery