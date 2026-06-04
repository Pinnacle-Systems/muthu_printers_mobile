import { createApi } from "@reduxjs/toolkit/query/react";
import CustomFetchBaseQuery from "../base/baseurlresolver";

const PROGRESS_API = createApi({
  reducerPath: "PROGRESS",
  baseQuery: CustomFetchBaseQuery(),
  tagTypes: ["Progress"],
  endpoints: (builder) => ({
     updateProcess:  builder.mutation({
      query: (body) => ({ url: `/process/Update/Process`, method: "PUT", body }),
      invalidatesTags: ["Progress"],
    }),

      updatePushProcess:  builder.mutation({
      query: (body) => ({ url: `/process/Update/PushProcess`, method: "PUT", body }),
      invalidatesTags: ["Progress"],
    }),

    UpdateCurrentProcess:  builder.mutation({
      query: (body) => ({ url: `/process/Update/CurrentProcess`, method: "PUT", body }),
      invalidatesTags: ["Progress"],
    }),

    
    
  }),
});

export const {
useUpdateProcessMutation,
useUpdatePushProcessMutation,
useUpdateCurrentProcessMutation
} = PROGRESS_API;

export default PROGRESS_API;