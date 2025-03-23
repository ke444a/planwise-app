import { useAuth } from "@/context/AuthContext";
import { 
    serverTimestamp,
    doc,
    getFirestore,
    updateDoc,
    getDoc
} from "@react-native-firebase/firestore";
import { useQueryClient, useMutation } from "@tanstack/react-query";


const tickActivitySubtask = async (
    uid: string, 
    date: Date,
    activityId: string, 
    subtaskId: string, 
    isCompleted: boolean
) => {
    const db = getFirestore();
    const dateString = date.toISOString().split("T")[0];
    const activityDocRef = doc(db, "schedules", uid, dateString, activityId);

    // Get the current activity data
    const activityDocSnap = await getDoc(activityDocRef);
    if (!activityDocSnap.exists) {
        throw new Error("Activity not found");
    }
    const activityData = activityDocSnap.data();
    // Update the subtask
    const updatedSubtasks = activityData?.subtasks.map((subtask: ISubtask) => {
        if (subtask.id === subtaskId) {
            return { ...subtask, isCompleted: isCompleted };
        }
        return subtask;
    });

    // Update the activity in Firestore
    await updateDoc(activityDocRef, {
        subtasks: updatedSubtasks,
        updatedAt: serverTimestamp()
    });
};

type TickActivitySubtaskData = {
    date: Date;
    activityId: string;
    subtaskId: string;
    isCompleted: boolean;
}

export const useTickActivitySubtaskMutation = () => {
    const { authUser } = useAuth();
    if (!authUser) {
        throw new Error("User not authenticated");
    }
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ date, activityId, subtaskId, isCompleted }: TickActivitySubtaskData) => 
            tickActivitySubtask(authUser.uid, date, activityId, subtaskId, isCompleted),
        onMutate: async (variables) => {
            // Cancel any outgoing refetches
            await queryClient.cancelQueries({ queryKey: ["schedule", variables.date, authUser.uid] });

            // Snapshot the previous value
            const previousItems = queryClient.getQueryData<IActivity[]>(["schedule", variables.date, authUser.uid]);

            // Optimistically update to the new value
            queryClient.setQueryData<IActivity[]>(["schedule", variables.date, authUser.uid], (old) => {
                if (!old) return [];

                return old.map(activity => {
                    if (activity.id === variables.activityId && activity.subtasks) {
                        const updatedSubtasks = activity.subtasks.map(subtask => {
                            if (subtask.id === variables.subtaskId) {
                                return { ...subtask, isCompleted: variables.isCompleted };
                            }
                            return subtask;
                        });

                        return { ...activity, subtasks: updatedSubtasks };
                    }
                    return activity;
                });
            });

            // Return a context object with the snapshotted value
            return { previousItems };
        },
        onError: (_error, variables, context) => {
            // If the mutation fails, roll back to the previous value
            queryClient.setQueryData<IActivity[]>(["schedule", variables.date, authUser.uid], context?.previousItems);
        },
        onSettled: (_data, _error, variables) => {
            queryClient.invalidateQueries({ queryKey: ["schedule", variables.date, authUser.uid] });
        },
    });
};
