import { getFirestore, doc, getDoc } from "@react-native-firebase/firestore";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";

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

export const useGetUserQuery = () => {
    const { authUser } = useAuth();
    return useQuery({
        queryKey: ["user", authUser?.uid],
        queryFn: () => getUser(authUser?.uid),
        enabled: !!authUser?.uid,
        staleTime: 1000 * 60 * 5
    });
};