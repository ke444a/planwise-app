import { doc, getFirestore, getDoc, setDoc } from "@react-native-firebase/firestore";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const addActivityToSchedule = async (activity: IActivity, date: Date, uid: string) => {
    const db = getFirestore();
    const formattedDate = date.toISOString().split("T")[0];
    const scheduleDocRef = doc(db, "schedules", uid, "dates", formattedDate); 
    
    const activityWithId = {
        ...activity,
        id: activity.id || Math.random().toString(36).slice(2, 12)
    };

    const scheduleDoc = await getDoc(scheduleDocRef);
    if (!scheduleDoc.exists) {
        await setDoc(scheduleDocRef, {
            date: formattedDate,
            activities: [activityWithId]
        });
    } else {
        const existingData = scheduleDoc.data();
        const existingActivities = existingData?.activities || [];
        
        await setDoc(scheduleDocRef, {
            date: formattedDate,
            activities: [...existingActivities, activityWithId]
        }, { merge: true });
    }
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
