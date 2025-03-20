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
    await addDoc(activityCollectionRef, activity);
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
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ["schedule", variables.date, variables.uid] });
        }
    });
};
