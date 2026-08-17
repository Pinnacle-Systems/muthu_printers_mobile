import { fetchBaseQuery } from "@reduxjs/toolkit/query";
import { API_BASE_URL } from "../../Utils/Storage/DotenvFinder";
import { SetHeader } from "./HeaderSet";

const CustomFetchBaseQuery = (BASE) => fetchBaseQuery({

    baseUrl : BASE ?? API_BASE_URL,
     prepareHeaders: async (headers, { endpoint }) => {
             await SetHeader(headers, {
               isLoginRequest: endpoint === "authenticate",
             })
             return headers
           }, timeout: 80000
        
    })

export default CustomFetchBaseQuery
