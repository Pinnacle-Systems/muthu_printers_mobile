import { createApi } from "@reduxjs/toolkit/query/react"; 
import CustomFetchBaseQuery from "../base/baseurlresolver";

const LOGINSLICE = createApi({
    reducerPath: "LOGIN",
    baseQuery: CustomFetchBaseQuery(),

    tagTypes: ["Auth"],

    endpoints: (builder) => ({          
            authenticate: builder.mutation({ 
            query: (credentials) => ({  
                url: "/users/login",
                method: "POST",
                headers: {
                    "Content-Type": "application/json; charset=UTF-8",
                },
                body: credentials,       
            }),
            invalidatesTags: ["Auth"],
        }),

    }),                                  
});


export const { useAuthenticateMutation } = LOGINSLICE; 

export default LOGINSLICE;