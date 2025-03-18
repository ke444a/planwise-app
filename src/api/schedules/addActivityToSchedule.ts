import { doc, 
    getFirestore, 
    collection, 
    query, 
    where, 
    getDocs, 
    setDoc, 
    updateDoc
} from "@react-native-firebase/firestore";
import { useMutation } from "@tanstack/react-query";

const addActivityToSchedule = async (activity: IActivity, date: Date, uid: string) => {
    const db = getFirestore();
    const schedulesCollection = collection(db, "schedules");
    const formattedDate = date.toISOString().split("T")[0];

    const q = query(schedulesCollection, where("date", "==", formattedDate), where("uid", "==", uid));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        const newDocRef = doc(schedulesCollection);
        await setDoc(newDocRef, {
            date: formattedDate,
            uid: uid,
            schedule: [activity]
        });
    } else {
        const docRef = querySnapshot.docs[0].ref;
        const existingSchedule = querySnapshot.docs[0].data()?.schedule || [];
        const updatedSchedule = [...existingSchedule, activity];
        await updateDoc(docRef, { schedule: updatedSchedule });
    }
};

type Data = {
    activity: IActivity;
    date: Date;
    uid: string;
}

export const useAddActivityToScheduleMutation = () => {
    return useMutation({
        mutationFn: ({ activity, date, uid }: Data) => addActivityToSchedule(activity, date, uid),
    });
};
