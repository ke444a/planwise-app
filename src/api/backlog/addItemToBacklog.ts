import { 
    serverTimestamp,
    collection,
    getFirestore,
    addDoc
} from "@react-native-firebase/firestore";
import { useQueryClient, useMutation } from "@tanstack/react-query";


export interface IBacklogDraft {
    id?: string;
    title: string;
    duration: number;
    isCompleted: boolean;
    itemType: "draft";
    subtasks: ISubtask[];
    createdAt?: any;
    updatedAt?: any;
}
export interface IBacklogActivity extends IActivity {
    itemType: "activity";
    createdAt?: any;
    updatedAt?: any;
}
export type IBacklogItem = IBacklogDraft | IBacklogActivity;

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
    uid: string;
}

export const useAddItemToBacklogMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ item, uid }: AddToBacklogData) => addItemToBacklog(item, uid),
        onSuccess: (_data, variables) => {
            // Invalidate and refetch backlog queries
            queryClient.invalidateQueries({ queryKey: ["backlog", variables.uid] });
        },
    });
};


