import {
  useGetJobCardsQuery,
  useGetJobCardListQuery,
  useGetJobCardQuery,
  useCreateJobCardMutation,
  useUpdateJobCardMutation,
  useDeleteJobCardMutation,
  useGetCompletedJobCardQuery,
} from "../../redux/api/jobcard";
import { userProfileStorage } from "../../Utils/Storage/mmkv";

export const useJobCardHooks = (hook) => {
  const {
    getJobCard_id,
    getJobCardList_params,
    enableJobCards = false,   // ✅ default false, pass true to enable
  } = hook || {};

  const userdetails = userProfileStorage?.get() ?? {};

  

  const commonParams = {
    ...userdetails,
    ...(getJobCardList_params ?? {}),
  };

  // ✅ Auto — only runs when id passed
  const getJobCard = useGetJobCardQuery(
    { ...commonParams, id: getJobCard_id },
    { skip: !getJobCard_id }
  );

  const getJobCardCompletedList =  useGetCompletedJobCardQuery(
    { ...commonParams }
  );

  // ✅ Auto — only runs when params passed
  const getJobCardList = useGetJobCardListQuery(
    commonParams,
    { skip: !getJobCardList_params }
  );

  // ✅ Manual flag — only runs when enableJobCards: true
  const getJobCards = useGetJobCardsQuery(
    commonParams,
    { skip: !enableJobCards }
  );

  const [createJobCard] = useCreateJobCardMutation();
  const [updateJobCard] = useUpdateJobCardMutation();
  const [deleteJobCard] = useDeleteJobCardMutation();

  return {
    getJobCards,
    getJobCardList,
    getJobCard,
    getJobCardCompletedList,
    createJobCard,
    updateJobCard,
    deleteJobCard,
  };
  
};