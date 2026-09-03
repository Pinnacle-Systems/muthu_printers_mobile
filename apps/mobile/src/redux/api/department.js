import { createApi } from "@reduxjs/toolkit/query/react";
import CustomFetchBaseQuery from "../base/baseurlresolver";

const DEPARTMENT_API = createApi({
  reducerPath: "DEPARTMENT",
  baseQuery: CustomFetchBaseQuery(),
  tagTypes: ["Department"],

  endpoints: (builder) => ({

    // GET /departments
    getDepartments: builder.query({
      query: (params) => ({ url: "/departments/mobile", method: "GET",params }),
      providesTags: ["Department"],
    }),

    

    // GET /departments/:id
    getDepartment: builder.query({
      query: (params) => ({ url: `/departments/${params?.id}`, method: "GET",params }),
      providesTags: (result, error, id) => [{ type: "Department", id }],
    }),

    // GET /departments/search/:key
    searchDepartments: builder.query({
      query: (params) => ({ url: `/departments/search/${params?.key ?? params?.searchKey}`, method: "GET",params }),
      providesTags: ["Department"],
    }),

    // POST /departments
    createDepartment: builder.mutation({
      query: (body) => ({ url: "/departments", method: "POST", body }),
      invalidatesTags: ["Department"],
    }),

    // PUT /departments/:id
    updateDepartment: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/departments/${id}`, method: "PUT", body }),
      invalidatesTags: (result, error, { id }) => [{ type: "Department", id }],
    }),

    // DELETE /departments/:id
    deleteDepartment: builder.mutation({
      query: (id) => ({ url: `/departments/${id}`, method: "DELETE" }),
      invalidatesTags: (result, error, id) => [{ type: "Department", id }],
    }),

  }),
});

export const {
  useGetDepartmentsQuery,
  useGetDepartmentQuery,
  useSearchDepartmentsQuery,
  useCreateDepartmentMutation,
  useUpdateDepartmentMutation,
  useDeleteDepartmentMutation,
} = DEPARTMENT_API;

export default DEPARTMENT_API;