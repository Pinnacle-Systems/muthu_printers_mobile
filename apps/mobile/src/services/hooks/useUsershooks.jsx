import { useAuthundicateMutation } from "../../redux/api/LoginRtk";
import { userProfileStorage } from "../../Utils/Storage/mmkv";

const useUserHooks = (hook) => {
  const { AuthundicateApi_params: Authparams } = hook || {};

  const userdetails = userProfileStorage?.get();

  const commonParams = {
    ...(Authparams ? Authparams : {}),
    ...(userdetails ? userdetails : {}),
  };

  const [AuthundicateApi] = useAuthundicateMutation(commonParams);

  return { AuthundicateApi };
};

export default useUserHooks;