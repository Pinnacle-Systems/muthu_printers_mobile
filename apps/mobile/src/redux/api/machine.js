import { createApi } from "@reduxjs/toolkit/query/react";
import CustomFetchBaseQuery from "../base/baseurlresolver";

const MACHINE_API = createApi({
  reducerPath: "MACHINE",
  baseQuery: CustomFetchBaseQuery(),
  tagTypes: ["Machine"],

  endpoints: (builder) => ({
    getNotificationMachines: builder.query({
      query: (params) => ({
        url: "/machine/notifications",
        method: "GET",
        params,
      }),
      providesTags: ["Machine"],
    }),

    markMachineViewed: builder.mutation({
      query: (body) => ({ url: "/machine/viewed", method: "POST", body }),
      invalidatesTags: ["Machine"],
    }),
  }),
});

export const {
  useGetNotificationMachinesQuery,
  useLazyGetNotificationMachinesQuery,
  useMarkMachineViewedMutation,
} = MACHINE_API;

export default MACHINE_API;
