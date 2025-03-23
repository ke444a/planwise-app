import { 
    getFirestore, 
    deleteDoc,
    doc,
} from "@react-native-firebase/firestore";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";


const deleteActivity = async (activityId: string, date: Date, uid: string) => {
    const db = getFirestore();
    const formattedDate = date.toISOString().split("T")[0];
    const activityDocRef = doc(db, "schedules", uid, formattedDate, activityId);
    await deleteDoc(activityDocRef);
};

type Data = {
    activityId: string;
    date: Date;
}

export const useDeleteActivityMutation = () => {
    const { authUser } = useAuth();
    if (!authUser) {
        throw new Error("User not authenticated");
    }
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ activityId, date }: Data) => deleteActivity(activityId, date, authUser.uid),
        onMutate: async (variables) => {
            // Cancel outgoing refetches
            await queryClient.cancelQueries({ 
                queryKey: ["schedule", variables.date, authUser.uid]
            });

            // Snapshot previous value
            const previousSchedule = queryClient.getQueryData<IActivity[]>(
                ["schedule", variables.date, authUser.uid]
            );

            // Optimistically update schedule
            queryClient.setQueryData<IActivity[]>(
                ["schedule", variables.date, authUser.uid],
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
                    ["schedule", variables.date, authUser.uid],
                    context.previousSchedule
                );
            }
        },
        onSettled: (_data, _error, variables) => {
            queryClient.invalidateQueries({ 
                queryKey: ["schedule", variables.date, authUser.uid]
            });
        },
    });
};
