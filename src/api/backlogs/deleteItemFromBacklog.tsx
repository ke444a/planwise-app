import { 
    getFirestore,
    doc,
    deleteDoc
} from "@react-native-firebase/firestore";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";

const deleteItemFromBacklog = async (id: string, uid: string) => {
    const db = getFirestore();
    const itemDoc = doc(db, "backlog", uid, "items", id);
    await deleteDoc(itemDoc);
};

type DeleteBacklogItemData = {
    id: string;
}

export const useDeleteItemFromBacklogMutation = () => {
    const { authUser } = useAuth();
    if (!authUser) {
        throw new Error("User not authenticated");
    }
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id }: DeleteBacklogItemData) => deleteItemFromBacklog(id, authUser.uid),
        onMutate: async ({ id }) => {
            // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
            await queryClient.cancelQueries({ queryKey: ["backlog", authUser.uid] });

            // Snapshot the previous value
            const previousItems = queryClient.getQueryData<IBacklogItem[]>(["backlog", authUser.uid]);

            // Optimistically update to the new value
            queryClient.setQueryData<IBacklogItem[]>(["backlog", authUser.uid], (old) => {
                if (!old) return [];
                return old.filter((item) => item.id !== id);
            });

            // Return a context object with the snapshotted value
            return { previousItems };
        },
        onError: (_err, _, context) => {
            queryClient.setQueryData<IBacklogItem[]>(["backlog", authUser.uid], context?.previousItems);
        },
        onSettled: (_data, _error) => {
            queryClient.invalidateQueries({ queryKey: ["backlog", authUser.uid] });
        },
    });
};
