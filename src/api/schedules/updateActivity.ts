import { useAuth } from "@/context/AuthContext";
import { getFirestore, doc, updateDoc, collection, query, getDocs, orderBy } from "@react-native-firebase/firestore";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { checkTimeOverlap } from "@/utils/timeOverlap";

interface UpdateActivityParams {
    activity: IActivity;
    date: Date;
    originalActivity: IActivity;
}

export class ScheduleOverlapError extends Error {
    overlappingActivity: IActivity;
    
    constructor(activity: IActivity) {
        super(`Activity overlaps with "${activity.title}" (${activity.startTime}-${activity.endTime})`);
        this.name = "ScheduleOverlapError";
        this.overlappingActivity = activity;
    }
}

const updateActivity = async (activity: IActivity, date: Date, uid: string, originalActivity: IActivity) => {
    const db = getFirestore();
    const formattedDate = date.toISOString().split("T")[0];

    // Check if time-related fields were changed
    const timeChanged = activity.startTime !== originalActivity.startTime || 
                       activity.endTime !== originalActivity.endTime ||
                       activity.duration !== originalActivity.duration;

    if (timeChanged) {
        // Get existing activities for overlap check
        const activityCollectionRef = collection(db, "schedules", uid, formattedDate);
        const q = query(activityCollectionRef, orderBy("startTime"));
        const querySnapshot = await getDocs(q);
        const existingActivities: IActivity[] = [];
        querySnapshot.forEach((doc) => {
            const data = { ...doc.data(), id: doc.id } as IActivity;
            // Exclude the current activity from overlap check
            if (data.id !== activity.id) {
                existingActivities.push(data);
            }
        });

        // Check for overlaps
        const overlappingActivity = checkTimeOverlap(activity.startTime, activity.endTime, existingActivities);
        if (overlappingActivity) {
            throw new ScheduleOverlapError(overlappingActivity);
        }
    }

    const activityDocRef = doc(db, "schedules", uid, formattedDate, activity.id!);
    await updateDoc(activityDocRef, {
        title: activity.title,
        type: activity.type,
        startTime: activity.startTime,
        endTime: activity.endTime,
        duration: activity.duration,
        priority: activity.priority,
        staminaCost: activity.staminaCost,
        subtasks: activity.subtasks || [],
        isCompleted: activity.isCompleted,
    });
    return activity;
};

export const useUpdateActivityMutation = () => {
    const { authUser } = useAuth();
    if (!authUser) {
        throw new Error("User not authenticated");
    }
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ activity, date, originalActivity }: UpdateActivityParams) => 
            updateActivity(activity, date, authUser.uid, originalActivity),
        onMutate: async ({ activity, date }) => {
            const queryKey = ["schedule", date, authUser.uid];
            await queryClient.cancelQueries({ queryKey });

            const previousActivities = queryClient.getQueryData<IActivity[]>(queryKey) ?? [];

            queryClient.setQueryData(queryKey, (old: IActivity[] | undefined) => {
                if (old) {
                    return old.map(item => item.id === activity.id ? activity : item);
                }
                return [activity];
            });

            return { previousActivities, queryKey, date };
        },
        onError: (_err, _variables, context) => {
            if (context) {
                queryClient.setQueryData(context.queryKey, context.previousActivities);
            }
        },
        onSettled: (_data, _error, variables) => {
            queryClient.invalidateQueries({ queryKey: ["schedule", variables.date, authUser.uid] });
        },
    });
};