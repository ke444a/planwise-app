import { doc, getFirestore, updateDoc } from "@react-native-firebase/firestore";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const completeBacklogItem = async (itemId: string, uid: string, isCompleted: boolean) => {
    const db = getFirestore();
    const itemDocRef = doc(db, "backlog", uid, "items", itemId);

    await updateDoc(itemDocRef, {
        isCompleted: isCompleted,
    });
};

type Data = {
    itemId: string;
    uid: string;
    isCompleted: boolean;
}

export const useCompleteBacklogItemMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ itemId, uid, isCompleted }: Data) => completeBacklogItem(itemId, uid, isCompleted),
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
                                isCompleted: variables.isCompleted,
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
