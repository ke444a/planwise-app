import { 
    doc,
    getFirestore,
    updateDoc
} from "@react-native-firebase/firestore";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";

const tickBacklogItemSubtask = async (
    uid: string,
    itemId: string,
    subtaskId: string,
    isCompleted: boolean
) => {
    const db = getFirestore();
    const itemDocRef = doc(db, "backlog", uid, "items", itemId);
    const itemDoc = await itemDocRef.get();
    if (!itemDoc.exists) {
        throw new Error("Backlog item not found");
    }
    const itemData = itemDoc.data();

    const updatedSubtasks = itemData?.subtasks.map((subtask: ISubtask) => {
        if (subtask.id === subtaskId) {
            return { ...subtask, isCompleted: isCompleted };
        }
        return subtask;
    });
    await updateDoc(itemDocRef, {
        subtasks: updatedSubtasks
    });
};

type TickBacklogItemSubtaskData = {
    itemId: string;
    subtaskId: string;
    isCompleted: boolean;
}

export const useTickBacklogItemSubtaskMutation = () => {
    const { authUser } = useAuth();
    if (!authUser) {
        throw new Error("User not authenticated");
    }
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ itemId, subtaskId, isCompleted }: TickBacklogItemSubtaskData) => 
            tickBacklogItemSubtask(authUser.uid, itemId, subtaskId, isCompleted),
        onMutate: async (variables) => {
            // Cancel any outgoing refetches
            await queryClient.cancelQueries({ queryKey: ["backlog", authUser.uid] });

            // Snapshot the previous value
            const previousItems = queryClient.getQueryData<IBacklogItem[]>(["backlog", authUser.uid]);

            // Optimistically update to the new value
            queryClient.setQueryData<IBacklogItem[]>(["backlog", authUser.uid], (old) => {
                if (!old) return [];

                return old.map(item => {
                    if (item.id === variables.itemId && item.subtasks) {
                        const updatedSubtasks = item.subtasks.map(subtask => {
                            if (subtask.id === variables.subtaskId) {
                                return { ...subtask, isCompleted: variables.isCompleted };
                            }
                            return subtask;
                        });

                        return { ...item, subtasks: updatedSubtasks };
                    }
                    return item;
                });
            });
            return { previousItems };
        },
        onError: (_error, _, context) => {
            queryClient.setQueryData<IBacklogItem[]>(["backlog", authUser.uid], context?.previousItems);
        },
        onSettled: (_data, _error) => {
            queryClient.invalidateQueries({ queryKey: ["backlog", authUser.uid] });
        },
    });
};
