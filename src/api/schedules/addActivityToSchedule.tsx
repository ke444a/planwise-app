import { useAuth } from "@/context/AuthContext";
import { 
    collection,
    getFirestore, 
    addDoc,
    query,
    getDocs,
    orderBy
} from "@react-native-firebase/firestore";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { checkTimeOverlap } from "@/utils/timeOverlap";


/*
    This is a special error that is used to handle schedule overlap.
    If activity overlaps with another activity, we're throwing this error.
    Our code is prepared to handle this error and will show a notification to the user.
*/

export class ScheduleOverlapError extends Error {
    overlappingActivity: IActivity;
    
    constructor(activity: IActivity) {
        super(`Activity overlaps with "${activity.title}" (${activity.startTime}-${activity.endTime})`);
        this.name = "ScheduleOverlapError";
        this.overlappingActivity = activity;
    }
}


const addActivityToSchedule = async (activity: IActivity, date: Date, uid: string) => {
    const db = getFirestore();
    const formattedDate = date.toISOString().split("T")[0];
    const activityCollectionRef = collection(db, "schedules", uid, formattedDate);

    // Get existing activities for the day
    const q = query(activityCollectionRef, orderBy("startTime"));
    const querySnapshot = await getDocs(q);
    const existingActivities: IActivity[] = [];
    querySnapshot.forEach((doc) => {
        existingActivities.push({ ...doc.data(), id: doc.id } as IActivity);
    });

    // Check for overlaps
    const overlappingActivity = checkTimeOverlap(activity.startTime, activity.endTime, existingActivities);
    if (overlappingActivity) {
        throw new ScheduleOverlapError(overlappingActivity);
    }

    const docRef = await addDoc(activityCollectionRef, {
        ...activity,
        subtasks: activity.subtasks || []
    });
    return { ...activity, id: docRef.id };
};

type Data = {
    activity: IActivity;
    date: Date;
}

export const useAddActivityToScheduleMutation = () => {
    const { authUser } = useAuth();
    if (!authUser) throw new Error("User not found");
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ activity, date }: Data) => addActivityToSchedule(activity, date, authUser.uid),
        onMutate: async ({ activity, date }) => {
            const queryKey = ["schedule", date, authUser.uid];
            await queryClient.cancelQueries({ queryKey });

            const previousActivities = queryClient.getQueryData<IActivity[]>(queryKey) ?? [];

            queryClient.setQueryData(queryKey, (old: IActivity[] | undefined) => {
                if (old) {
                    return [...old, activity];
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
