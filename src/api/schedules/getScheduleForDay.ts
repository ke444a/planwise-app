import { getFirestore, collection, getDocs, query, orderBy } from "@react-native-firebase/firestore";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";


const getScheduleForDay = async (date: Date, uid: string): Promise<IActivity[]> => {
    const db = getFirestore();
    const formattedDate = date.toISOString().split("T")[0];
    const activityCollection = collection(db, "schedules", uid, formattedDate);

    const q = query(activityCollection, orderBy("startTime"));
    const querySnapshot = await getDocs(q);
    
    const activities: IActivity[] = [];
    querySnapshot.forEach((doc) => {
        activities.push({...doc.data(), id: doc.id} as IActivity);
    });

    return activities;
};

export const useGetScheduleForDayQuery = (date: Date) => {
    const { authUser } = useAuth();
    if (!authUser) {
        throw new Error("User not authenticated");
    }
    
    return useQuery({
        queryKey: ["schedule", date, authUser.uid],
        queryFn: () => getScheduleForDay(date, authUser.uid),
        // Sort activities by startTime
        select: (data) => {
            return data.sort((a, b) => {
                const [aHours, aMinutes] = a.startTime.split(":").map(Number);
                const [bHours, bMinutes] = b.startTime.split(":").map(Number);
                return (aHours * 60 + aMinutes) - (bHours * 60 + bMinutes);
            });
        }
    });
};
