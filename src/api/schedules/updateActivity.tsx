import { useAuth } from "@/context/AuthContext";
import { getFirestore, doc, collection, query, getDocs, orderBy, setDoc, deleteDoc } from "@react-native-firebase/firestore";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { checkTimeOverlap } from "@/utils/timeOverlap";
import { ScheduleOverlapError } from "./addActivityToSchedule";

interface UpdateActivityParams {
    activity: IActivity;
    originalDate: Date;
    selectedDate: Date;
    originalActivity: IActivity;
}

const updateActivity = async (activity: IActivity, originalDate: Date, selectedDate: Date, uid: string, originalActivity: IActivity) => {
    const db = getFirestore();
    const formattedOriginalDate = originalDate.toISOString().split("T")[0];
    const formattedSelectedDate = selectedDate.toISOString().split("T")[0];

    // Check if time-related fields were changed
    const timeChanged = activity.startTime !== originalActivity.startTime || 
                       activity.endTime !== originalActivity.endTime ||
                       activity.duration !== originalActivity.duration ||
                       formattedOriginalDate !== formattedSelectedDate;

    if (timeChanged) {
        // Get existing activities for overlap check
        const activityCollectionRef = collection(db, "schedules", uid, formattedSelectedDate);
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

    const originalActivityDocRef = doc(db, "schedules", uid, formattedOriginalDate, activity.id!);
    const selectedActivityDocRef = doc(db, "schedules", uid, formattedSelectedDate, activity.id!);
    await deleteDoc(originalActivityDocRef);
    await setDoc(selectedActivityDocRef, {
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
        mutationFn: ({ activity, originalDate, selectedDate, originalActivity }: UpdateActivityParams) => 
            updateActivity(activity, originalDate, selectedDate, authUser.uid, originalActivity),
        onMutate: async ({ activity, originalDate }) => {
            const queryKey = ["schedule", originalDate, authUser.uid];
            await queryClient.cancelQueries({ queryKey });

            const previousActivities = queryClient.getQueryData<IActivity[]>(queryKey) ?? [];

            queryClient.setQueryData(queryKey, (old: IActivity[] | undefined) => {
                if (old) {
                    return old.map(item => item.id === activity.id ? activity : item);
                }
                return [activity];
            });

            return { previousActivities, queryKey, originalDate };
        },
        onError: (_err, _variables, context) => {
            if (context) {
                queryClient.setQueryData(context.queryKey, context.previousActivities);
            }
        },
        onSettled: (_data, _error, variables) => {
            queryClient.invalidateQueries({ queryKey: ["schedule", variables.originalDate, authUser.uid] });
        },
    });
};