import { 
    getFirestore, 
    deleteDoc,
    doc,
} from "@react-native-firebase/firestore";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const deleteActivity = async (activityId: string, date: Date, uid: string) => {
    const db = getFirestore();
    const formattedDate = date.toISOString().split("T")[0];
    const activityDocRef = doc(db, "schedules", uid, formattedDate, activityId);
    await deleteDoc(activityDocRef);
};

type Data = {
    activityId: string;
    date: Date;
    uid: string;
}

export const useDeleteActivityMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ activityId, date, uid }: Data) => deleteActivity(activityId, date, uid),
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
                    return old.filter(activity => activity.id !== variables.activityId);
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
        },
    });
};
