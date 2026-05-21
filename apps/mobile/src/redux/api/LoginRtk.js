import { createApi } from "@reduxjs/toolkit/query/react"; 
import CustomfetchbaseQury from "../base/baseurlresolver";

const LOGINSLICE = createApi({
    reducerPath: "LOGIN",
    baseQuery: CustomfetchbaseQury(),

    tagTypes: ["Auth"],

    endpoints: (builder) => ({          
            authundicate: builder.mutation({ 
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


export const { useAuthundicateMutation } = LOGINSLICE; 

export default LOGINSLICE;