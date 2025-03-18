import { getFirestore, doc, getDoc } from "@react-native-firebase/firestore";
import { useQuery } from "@tanstack/react-query";

const getUser = async (uid?: string) => {
    if (!uid) return null;

    const db = getFirestore();
    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists) {
        return userSnap.data() as IUser;
    } else {
        return null;
    }
};

export const useGetUserQuery = (uid?: string) => {
    return useQuery({
        queryKey: ["user", uid],
        queryFn: () => getUser(uid),
        enabled: !!uid
    });
};