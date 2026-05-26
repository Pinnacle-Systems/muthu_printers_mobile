import { createApi } from "@reduxjs/toolkit/query/react";
import CustomfetchbaseQury from "../base/baseurlresolver";

const PROGRESS_API = createApi({
  reducerPath: "PROGRESS",
  baseQuery: CustomfetchbaseQury(),
  tagTypes: ["Progress"],
  endpoints: (builder) => ({
     updateProcess:  builder.mutation({
      query: (body) => ({ url: `/process/Update/Process`, method: "PUT", body }),
      invalidatesTags: ["Progress"],
    }),
    
  }),
});

export const {
useUpdateProcessMutation
} = PROGRESS_API;

export default PROGRESS_API;