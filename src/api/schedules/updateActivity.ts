import { getFirestore, doc, updateDoc } from "@react-native-firebase/firestore";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface UpdateActivityParams {
    activity: IActivity;
    date: Date;
    uid: string;
}

const updateActivity = async ({ activity, date, uid }: UpdateActivityParams) => {
    const db = getFirestore();
    const formattedDate = date.toISOString().split("T")[0];
    const activityDocRef = doc(db, "schedules", uid, formattedDate, activity.id!);

    await updateDoc(activityDocRef, {
        title: activity.title,
        type: activity.type,
        startTime: activity.startTime,
        endTime: activity.endTime,
        duration: activity.duration,
        priority: activity.priority,
        staminaCost: activity.staminaCost,
        subtasks: activity.subtasks,
        isCompleted: activity.isCompleted,
    });

    return activity;
};

export const useUpdateActivityMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ activity, date, uid }: UpdateActivityParams) => updateActivity({ activity, date, uid }),
        onMutate: async ({ activity, date, uid }) => {
            const queryKey = ["schedule", date, uid];
            await queryClient.cancelQueries({ queryKey });

            const previousActivities = queryClient.getQueryData<IActivity[]>(queryKey) ?? [];

            queryClient.setQueryData(queryKey, (old: IActivity[] | undefined) => {
                if (old) {
                    return old.map(item => item.id === activity.id ? activity : item);
                }
                return [activity];
            });

            return { previousActivities, queryKey, uid, date };
        },
        onError: (_err, _variables, context) => {
            if (context) {
                queryClient.setQueryData(context.queryKey, context.previousActivities);
            }
        },
        onSettled: (_data, _error, variables) => {
            queryClient.invalidateQueries({ queryKey: ["schedule", variables.date, variables.uid] });
        },
    });
};