import { 
    doc, 
    getFirestore, 
    updateDoc,
} from "@react-native-firebase/firestore";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const uncompleteActivity = async (activityId: string, date: Date, uid: string) => {
    const db = getFirestore();
    const formattedDate = date.toISOString().split("T")[0];
    const activityDocRef = doc(db, "schedules", uid, formattedDate, activityId);
    await updateDoc(activityDocRef, { isCompleted: false });
};

type Data = {
    activityId: string;
    date: Date;
    uid: string;
}

export const useUncompleteActivityMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ activityId, date, uid }: Data) => uncompleteActivity(activityId, date, uid),
        onMutate: async (variables) => {
            // Cancel any outgoing refetches
            // (so they don't overwrite our optimistic update)
            await queryClient.cancelQueries({ queryKey: ["schedule", variables.date, variables.uid] });

            // Snapshot the previous value
            const previousSchedule = queryClient.getQueryData<IActivity[]>(["schedule", variables.date, variables.uid]);

            // Optimistically update to the new value
            queryClient.setQueryData<IActivity[]>(["schedule", variables.date, variables.uid], (old) => {
                return old?.map((activity) =>
                    activity.id === variables.activityId ? { ...activity, isCompleted: false } : activity
                ) ?? [];
            });

            // Return a context object with the snapshotted value
            return { previousSchedule };
        },
        // If the mutation fails, use the context returned from onMutate to roll back
        onError: (_err, variables, context: any) => {
            queryClient.setQueryData<IActivity[]>(["schedule", variables.date, variables.uid], context.previousSchedule);
        },
        // Always refetch after error or success:
        onSettled: (_data, _error, variables) => {
            queryClient.invalidateQueries({ queryKey: ["schedule", variables.date, variables.uid] });
        },
    });
};
