import {  useGetJobCardsQuery,
  useGetJobCardListQuery,
  useGetJobCardQuery,
  useCreateJobCardMutation,
  useUpdateJobCardMutation,
  useDeleteJobCardMutation, } from "../../redux/api/jobcard";


export const useJobCardHooks = (hook) => {
  const { getJobCard_id, getJobCardList_params } = hook || {};

  const getJobCards    = useGetJobCardsQuery({});
  const getJobCardList = useGetJobCardListQuery(getJobCardList_params || {});
  const getJobCard     = useGetJobCardQuery(getJobCard_id, { skip: !getJobCard_id });

  const [createJobCard] = useCreateJobCardMutation();
  const [updateJobCard] = useUpdateJobCardMutation();
  const [deleteJobCard] = useDeleteJobCardMutation();

  return {
    getJobCards,
    getJobCardList,
    getJobCard,
    createJobCard,
    updateJobCard,
    deleteJobCard,
  };
};