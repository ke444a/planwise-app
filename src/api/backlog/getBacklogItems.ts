import { 
    collection,
    getFirestore,
    query,
    orderBy,
    getDocs
} from "@react-native-firebase/firestore";
import { useQuery } from "@tanstack/react-query";
import { IBacklogItem } from "./addItemToBacklog";

const getBacklogItems = async (uid?: string | null) => {
    if (!uid) return [];

    const db = getFirestore();
    const backlogCollection = collection(db, "backlog", uid, "items");
    const q = query(backlogCollection, orderBy("updatedAt", "desc"));

    const querySnapshot = await getDocs(q);
    const items: IBacklogItem[] = [];
    querySnapshot.forEach(doc => {
        items.push({
            id: doc.id,
            ...doc.data()
        } as IBacklogItem);
    });
    return items;
};

export const useGetBacklogItemsQuery = (uid?: string | null) => {
    return useQuery({
        queryKey: ["backlog", uid],
        queryFn: () => getBacklogItems(uid),
        enabled: !!uid,
    });
};

