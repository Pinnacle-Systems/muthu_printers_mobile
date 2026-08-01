import { useAuthenticateMutation } from "../../redux/api/LoginRtk";
import { userProfileStorage } from "../../Utils/Storage/mmkv";

const useUserHooks = (hook) => {
  const { authenticateApi_params: Authparams } = hook || {};

  const userdetails = userProfileStorage?.get();

  const commonParams = {
    ...(Authparams ? Authparams : {}),
    ...(userdetails ? userdetails : {}),
  };

  const [authenticateApi] = useAuthenticateMutation(commonParams);

  return { authenticateApi };
};

export default useUserHooks;