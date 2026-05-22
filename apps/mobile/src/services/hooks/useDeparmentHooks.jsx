import { useGetDepartmentsQuery,
  useGetDepartmentQuery,
  useSearchDepartmentsQuery,
  useCreateDepartmentMutation,
  useUpdateDepartmentMutation,
  useDeleteDepartmentMutation } from "../../redux/api/department";





export const useDepartmentHooks = (hook) => {
  const {
    getDepartment_id,
    searchDepartments_key,
    getDepartments_params,
  } = hook || {};

  const getDepartments   = useGetDepartmentsQuery(getDepartments_params || {});
  const getDepartment    = useGetDepartmentQuery(getDepartment_id,   { skip: !getDepartment_id });
  const searchDepartments = useSearchDepartmentsQuery(searchDepartments_key, { skip: !searchDepartments_key });

  const [createDepartment] = useCreateDepartmentMutation();
  const [updateDepartment] = useUpdateDepartmentMutation();
  const [deleteDepartment] = useDeleteDepartmentMutation();

  return {
    getDepartments,
    getDepartment,
    searchDepartments,
    createDepartment,
    updateDepartment,
    deleteDepartment,
  };
};

