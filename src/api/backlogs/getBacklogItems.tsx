import { 
    collection,
    getFirestore,
    query,
    orderBy,
    getDocs
} from "@react-native-firebase/firestore";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";

const getBacklogItems = async (uid: string) => {
    const db = getFirestore();
    const backlogCollection = collection(db, "backlog", uid, "items");
    const q = query(backlogCollection, orderBy("updatedAt", "desc"));

    const querySnapshot = await getDocs(q);
    const items: IBacklogItem[] = [];
    querySnapshot.forEach(doc => {
        items.push({
            ...doc.data(),
            id: doc.id,
        } as IBacklogItem);
    });
    return items;
};

export const useGetBacklogItemsQuery = () => {
    const { authUser } = useAuth();
    if (!authUser) throw new Error("User not authenticated");

    return useQuery({
        queryKey: ["backlog", authUser.uid],
        queryFn: () => getBacklogItems(authUser.uid),
        enabled: !!authUser.uid,
    });
};

