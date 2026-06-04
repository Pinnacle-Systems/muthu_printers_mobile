import { createApi } from "@reduxjs/toolkit/query/react";
import CustomFetchBaseQuery from "../base/baseurlresolver";

const JOBCARD_API = createApi({
  reducerPath: "JOBCARD",
  baseQuery: CustomFetchBaseQuery(),
  tagTypes: ["JobCard"],

  endpoints: (builder) => ({

    // GET /jobcards
    getJobCards: builder.query({
      query: (params) => ({ url: "/jobCard", method: "GET",params }),
      providesTags: ["JobCard"],
    }),

    // GET /jobcards/jobCardList
    getJobCardList: builder.query({
      query: (params) => ({ url: "/jobCard/get_mob_joblist", method: "GET",params }),
      providesTags: ["JobCard"],
    }),

     getTakenJobcard: builder.query({
      query: (params) => ({ url: "/jobCard/getEmployeeTakenJobcard", method: "GET",params }),
      providesTags: ["JobCard"],
    }),

    // GET /jobcards/:id
    getJobCard: builder.query({
      query: (params) => ({ url: `/jobCard/get_mob_jobcard`, method: "GET" , params}),
      providesTags: (result, error, id) => [{ type: "JobCard", id }],
    }),

     getCompletedJobCard: builder.query({
      query: (params) => ({ url: `/jobCard/get_mob_compl_jobcard`, method: "GET" , params}),
      providesTags: (result, error, id) => [{ type: "JobCard", id }],
    }),

      getDepmachines: builder.query({
      query: (params) => ({ url: `/jobCard/getMachinebydep`, method: "GET" , params}),
      providesTags: (result, error, id) => [{ type: "JobCard", id }],
    }),

    // POST /jobcards
    createJobCard: builder.mutation({
      query: (body) => ({ url: "/jobCard", method: "POST", body }),
      invalidatesTags: ["JobCard"],
    }),

    // PUT /jobcards/:id
    updateJobCard: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/jobCard/updateJobCardState/${id}`, method: "PUT", body }),
      invalidatesTags: (result, error, { id }) => [{ type: "JobCard", id }],
    }),

    // DELETE /jobcards/:id
    deleteJobCard: builder.mutation({
      query: (id) => ({ url: `/jobCard/${id}`, method: "DELETE" }),
      invalidatesTags: (result, error, id) => [{ type: "JobCard", id }],
    }),

  }),
});

export const {
  useGetJobCardsQuery,
  useGetJobCardListQuery,
  useGetJobCardQuery,
  useCreateJobCardMutation,
  useUpdateJobCardMutation,
  useDeleteJobCardMutation,
  useGetDepmachinesQuery,
  useGetTakenJobcardQuery,
  useGetCompletedJobCardQuery
} = JOBCARD_API;

export default JOBCARD_API;