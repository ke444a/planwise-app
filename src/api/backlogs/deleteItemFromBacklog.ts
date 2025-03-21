import { 
    getFirestore,
    doc,
    deleteDoc
} from "@react-native-firebase/firestore";
import { useQueryClient, useMutation } from "@tanstack/react-query";

const deleteItemFromBacklog = async (id: string, uid: string) => {
    const db = getFirestore();
    const itemDoc = doc(db, "backlog", uid, "items", id);
    await deleteDoc(itemDoc);
};

type DeleteBacklogItemData = {
    id: string;
    uid: string;
}

export const useDeleteItemFromBacklogMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, uid }: DeleteBacklogItemData) => deleteItemFromBacklog(id, uid),
        onMutate: async ({ id, uid }) => {
            // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
            await queryClient.cancelQueries({ queryKey: ["backlog", uid] });

            // Snapshot the previous value
            const previousItems = queryClient.getQueryData<IBacklogItem[]>(["backlog", uid]);

            // Optimistically update to the new value
            queryClient.setQueryData<IBacklogItem[]>(["backlog", uid], (old) => {
                if (!old) return [];
                return old.filter((item) => item.id !== id);
            });

            // Return a context object with the snapshotted value
            return { previousItems, uid };
        },
        onError: (_err, _variables, context) => {
            queryClient.setQueryData<IBacklogItem[]>(["backlog", context?.uid!], context?.previousItems);
        },
        onSettled: (_data, _error, variables) => {
            queryClient.invalidateQueries({ queryKey: ["backlog", variables.uid] });
        },
    });
};
