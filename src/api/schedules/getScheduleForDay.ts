import { convertFromJsonToActivity } from "@/utils/convertFromJsonToActivity";
import { getFirestore, collection, query, where, getDocs } from "@react-native-firebase/firestore";
import { useQuery } from "@tanstack/react-query";

const getScheduleForDay = async (date: Date, uid: string): Promise<IActivity[]> => {
    const db = getFirestore();
    const schedulesCollection = collection(db, "schedules");
    const formattedDate = date.toISOString().split("T")[0];
    console.log(formattedDate, uid);
    const q = query(
        schedulesCollection,
        where("date", "==", formattedDate),
        where("uid", "==", uid)
    );
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
        return [];
    }
    return querySnapshot.docs[0].data().schedule.schedule;
};

export const useGetScheduleForDayQuery = (date: Date, uid: string) => {
    return useQuery({
        queryKey: ["schedule", date, uid],
        queryFn: () => getScheduleForDay(date, uid),
        select: (data) => {
            const convertedData = convertFromJsonToActivity(data);
            return convertedData.sort((a, b) => {
                const [aHours, aMinutes] = a.startTime.split(":").map(Number);
                const [bHours, bMinutes] = b.startTime.split(":").map(Number);
                return (aHours * 60 + aMinutes) - (bHours * 60 + bMinutes);
            });
        }
    });
};

