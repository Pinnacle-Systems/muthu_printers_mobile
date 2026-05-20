import  {createApi, fetchBaseQuery} from "@reduxjs/toolkit/query"
import CustomfetchbaseQury from "../base/baseurlresolver"


const LOGINSLICE = createApi({
    reducerPath : "LOGIN",
    baseQuery :  CustomfetchbaseQury(),

    tagTypes : ["Auth"],

    endpoints : (builder)=>{
           
        Authundicate : builder?.query({
            query :()=>({
                url : "/authundicate",
                  method: 'GET',
                    headers: {
                        'Content-type': 'application/json; charset=UTF-8',
                    },
                
            }),
            providesTags: ["Auth"]
        })


    }

    
})

const {useGetAuthundicate}=LOGINSLICE

export default LOGINSLICE