import { useGetDepartmentsQuery,
  useGetDepartmentQuery,
  useSearchDepartmentsQuery,
  useCreateDepartmentMutation,
  useUpdateDepartmentMutation,
  useDeleteDepartmentMutation } from "../../redux/api/department";
import { userProfileStorage } from "../../Utils/Storage/mmkv";

export const useDepartmentHooks = (hook) => {
  const {
    getDepartment_id,
    searchDepartments_key,
    getDepartments_params,
  } = hook || {};

  const userdetails = userProfileStorage?.get();

  const commonParams = {
    ...(getDepartments_params ? getDepartments_params : {}),
    ...(userdetails ? userdetails : {}),
  };

  const getDepartments    = useGetDepartmentsQuery(commonParams);
  const getDepartment     = useGetDepartmentQuery({ ...commonParams, id: getDepartment_id }, { skip: !getDepartment_id });
  const searchDepartments = useSearchDepartmentsQuery({ ...commonParams, key: searchDepartments_key }, { skip: !searchDepartments_key });

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