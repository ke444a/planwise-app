import { doc, getFirestore, updateDoc } from "@react-native-firebase/firestore";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { IBacklogItem } from "./addItemToBacklog";

const uncompleteBacklogItem = async (itemId: string, uid: string) => {
    const db = getFirestore();
    const itemDocRef = doc(db, "backlog", uid, "items", itemId);

    await updateDoc(itemDocRef, {
        isCompleted: false,
        updatedAt: new Date()
    });
};

type Data = {
    itemId: string;
    uid: string;
}

export const useUncompleteBacklogItemMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ itemId, uid }: Data) => uncompleteBacklogItem(itemId, uid),
        onMutate: async (variables) => {
            // Cancel outgoing refetches
            await queryClient.cancelQueries({ 
                queryKey: ["backlog", variables.uid]
            });

            // Snapshot previous value
            const previousBacklog = queryClient.getQueryData<IBacklogItem[]>(
                ["backlog", variables.uid]
            );

            // Optimistically update backlog
            queryClient.setQueryData<IBacklogItem[]>(
                ["backlog", variables.uid],
                (old) => {
                    if (!old) return [];
                    return old.map(item => {
                        if (item.id === variables.itemId) {
                            return {
                                ...item,
                                isCompleted: false,
                                updatedAt: new Date()
                            };
                        }
                        return item;
                    });
                }
            );

            return { previousBacklog };
        },
        onError: (_error, variables, context) => {
            if (context?.previousBacklog) {
                queryClient.setQueryData(
                    ["backlog", variables.uid],
                    context.previousBacklog
                );
            }
        },
        onSettled: (_data, _error, variables) => {
            queryClient.invalidateQueries({ 
                queryKey: ["backlog", variables.uid]
            });
        }
    });
};
