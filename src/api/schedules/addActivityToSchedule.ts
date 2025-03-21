import { 
    collection,
    getFirestore, 
    addDoc,
} from "@react-native-firebase/firestore";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const addActivityToSchedule = async (activity: IActivity, date: Date, uid: string) => {
    const db = getFirestore();
    const formattedDate = date.toISOString().split("T")[0];
    const activityCollectionRef = collection(db, "schedules", uid, formattedDate);
    const docRef = await addDoc(activityCollectionRef, activity);
    return { ...activity, id: docRef.id };
};

type Data = {
    activity: IActivity;
    date: Date;
    uid: string;
}

export const useAddActivityToScheduleMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ activity, date, uid }: Data) => addActivityToSchedule(activity, date, uid),
        onMutate: async ({ activity, date, uid }) => {
            const queryKey = ["schedule", date, uid];
            await queryClient.cancelQueries({ queryKey });

            const previousActivities = queryClient.getQueryData<IActivity[]>(queryKey) ?? [];

            queryClient.setQueryData(queryKey, (old: IActivity[] | undefined) => {
                if (old) {
                    return [...old, activity];
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
