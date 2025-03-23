import { getFirestore, doc, getDoc } from "@react-native-firebase/firestore";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";

const getBacklogItem = async (itemId: string, uid: string): Promise<IBacklogItem | undefined> => {
    const db = getFirestore();
    const backlogItemRef = doc(db, "backlog", uid, "items", itemId);

    const docSnap = await getDoc(backlogItemRef);
    if (docSnap.exists) {
        return { ...docSnap.data(), id: docSnap.id } as IBacklogItem;
    }
    return undefined;
};

export const useGetBacklogItemQuery = (itemId: string) => {
    const { authUser } = useAuth();
    if (!authUser) {
        throw new Error("User not authenticated");
    }
    return useQuery({
        queryKey: ["backlog", "item", itemId, authUser.uid],
        queryFn: () => getBacklogItem(itemId, authUser.uid),
        enabled: !!itemId,
    });
}; 