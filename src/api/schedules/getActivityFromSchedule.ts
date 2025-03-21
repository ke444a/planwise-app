import { getFirestore, doc, getDoc } from "@react-native-firebase/firestore";
import { useQuery } from "@tanstack/react-query";

const getActivityFromSchedule = async (activityId: string, date: Date, uid: string): Promise<IActivity | undefined> => {
    const db = getFirestore();
    const formattedDate = date.toISOString().split("T")[0];
    const activityDocRef = doc(db, "schedules", uid, formattedDate, activityId);

    const docSnap = await getDoc(activityDocRef);
    if (docSnap.exists) {
        return { ...docSnap.data(), id: docSnap.id } as IActivity;
    } else {
        return undefined;
    }
};

export const useGetActivityFromScheduleQuery = (activityId: string, date: Date, uid: string) => {
    return useQuery({
        queryKey: ["schedule", date, uid, activityId],
        queryFn: () => getActivityFromSchedule(activityId, date, uid),
        enabled: !!activityId,
    });
};
