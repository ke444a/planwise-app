import { doc, getFirestore, updateDoc } from "@react-native-firebase/firestore";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const completeActivity = async (activityId: string, date: Date, uid: string, isCompleted: boolean) => {
    const db = getFirestore();
    const formattedDate = date.toISOString().split("T")[0];
    const activityDocRef = doc(db, "schedules", uid, formattedDate, activityId);
    await updateDoc(activityDocRef, { isCompleted: isCompleted });
};

type Data = {
    activityId: string;
    date: Date;
    uid: string;
    isCompleted: boolean;
}

export const useCompleteActivityMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ activityId, date, uid, isCompleted }: Data) => completeActivity(activityId, date, uid, isCompleted),
        onMutate: async (variables) => {
            // Cancel outgoing refetches
            await queryClient.cancelQueries({ 
                queryKey: ["schedule", variables.date, variables.uid]
            });

            // Snapshot previous value
            const previousSchedule = queryClient.getQueryData<IActivity[]>(
                ["schedule", variables.date, variables.uid]
            );

            // Optimistically update schedule
            queryClient.setQueryData<IActivity[]>(
                ["schedule", variables.date, variables.uid],
                (old) => {
                    if (!old) return [];
                    return old.map(activity => {
                        if (activity.id === variables.activityId) {
                            return {
                                ...activity,
                                isCompleted: variables.isCompleted
                            };
                        }
                        return activity;
                    });
                }
            );

            return { previousSchedule };
        },
        onError: (_error, variables, context) => {
            if (context?.previousSchedule) {
                queryClient.setQueryData(
                    ["schedule", variables.date, variables.uid],
                    context.previousSchedule
                );
            }
        },
        onSettled: (_data, _error, variables) => {
            queryClient.invalidateQueries({ 
                queryKey: ["schedule", variables.date, variables.uid]
            });
        }
    });
};
