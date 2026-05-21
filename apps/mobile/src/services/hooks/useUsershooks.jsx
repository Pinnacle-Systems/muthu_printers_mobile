import { useAuthundicateMutation } from "../../redux/api/LoginRtk"


const useUserHooks = (hook) =>{
  const {AuthundicateApi_params: Authparams} = hook || {}
  const [AuthundicateApi] = useAuthundicateMutation(Authparams || {})
   return {AuthundicateApi}
}

export default useUserHooks