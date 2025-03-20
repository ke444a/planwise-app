import { getFirestore, doc, getDoc } from "@react-native-firebase/firestore";
import { useQuery } from "@tanstack/react-query";

const getScheduleForDay = async (date: Date, uid: string): Promise<IActivity[]> => {
    const db = getFirestore();
    const formattedDate = date.toISOString().split("T")[0];
    const scheduleDocRef = doc(db, "schedules", uid, "dates", formattedDate);
    const scheduleDoc = await getDoc(scheduleDocRef);

    if (!scheduleDoc.exists) {
        return [];
    }

    const scheduleData = scheduleDoc.data();
    return scheduleData?.activities || [];
};

export const useGetScheduleForDayQuery = (date: Date, uid: string) => {
    return useQuery({
        queryKey: ["schedule", date, uid],
        queryFn: () => getScheduleForDay(date, uid),
        select: (data) => {
            return data.sort((a, b) => {
                const [aHours, aMinutes] = a.startTime.split(":").map(Number);
                const [bHours, bMinutes] = b.startTime.split(":").map(Number);
                return (aHours * 60 + aMinutes) - (bHours * 60 + bMinutes);
            });
        }
    });
};
