import { useAuth } from "@/context/AuthContext";
import { getFirestore, doc, getDoc } from "@react-native-firebase/firestore";
import { useQuery } from "@tanstack/react-query";


const getActivityFromSchedule = async (activityId: string, date: Date, uid: string): Promise<IActivity | null> => {
    const db = getFirestore();
    const formattedDate = date.toISOString().split("T")[0];
    const activityDocRef = doc(db, "schedules", uid, formattedDate, activityId);
    const docSnap = await getDoc(activityDocRef);
    if (docSnap.exists) {
        return { ...docSnap.data(), id: docSnap.id } as IActivity;
    }
    return null;
};

export const useGetActivityFromScheduleQuery = (activityId: string, date: Date) => {
    const { authUser } = useAuth();
    if (!authUser) {
        throw new Error("User not authenticated");
    }
    
    return useQuery({
        queryKey: ["schedule", date, authUser.uid, activityId],
        queryFn: () => getActivityFromSchedule(activityId, date, authUser.uid),
        enabled: !!activityId,
    });
};
