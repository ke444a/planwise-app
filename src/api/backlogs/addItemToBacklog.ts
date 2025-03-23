import { useAuth } from "@/context/AuthContext";
import { 
    serverTimestamp,
    collection,
    getFirestore,
    addDoc
} from "@react-native-firebase/firestore";
import { useQueryClient, useMutation } from "@tanstack/react-query";

const addItemToBacklog = async (item: IBacklogItem, uid: string) => {
    const db = getFirestore();
    const backlogCollection = collection(db, "backlog", uid, "items");
    const timestamp = serverTimestamp();
    const itemWithTimestamps = {
        ...item,
        createdAt: timestamp,
        updatedAt: timestamp
    };

    await addDoc(backlogCollection, itemWithTimestamps);
};

type AddToBacklogData = {
    item: IBacklogItem;
}

export const useAddItemToBacklogMutation = () => {
    const { authUser } = useAuth();
    if (!authUser) throw new Error("User not found");
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ item }: AddToBacklogData) => addItemToBacklog(item, authUser.uid),
        onSuccess: () => {
            // Invalidate and refetch backlog queries
            queryClient.invalidateQueries({ queryKey: ["backlog", authUser.uid] });
        },
    });
};


