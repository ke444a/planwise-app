import { doc, getFirestore, updateDoc } from "@react-native-firebase/firestore";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";


const completeBacklogItem = async (itemId: string, uid: string, isCompleted: boolean) => {
    const db = getFirestore();
    const itemDocRef = doc(db, "backlog", uid, "items", itemId);

    await updateDoc(itemDocRef, {
        isCompleted: isCompleted,
    });
};

type Data = {
    itemId: string;
    isCompleted: boolean;
}

export const useCompleteBacklogItemMutation = () => {
    const { authUser } = useAuth();
    if (!authUser) {
        throw new Error("User not authenticated");
    }
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ itemId, isCompleted }: Data) => completeBacklogItem(itemId, authUser.uid, isCompleted),
        onMutate: async (variables) => {
            // Cancel outgoing refetches
            await queryClient.cancelQueries({ 
                queryKey: ["backlog", authUser.uid]
            });

            // Snapshot previous value
            const previousBacklog = queryClient.getQueryData<IBacklogItem[]>(
                ["backlog", authUser.uid]
            );

            // Optimistically update backlog
            queryClient.setQueryData<IBacklogItem[]>(
                ["backlog", authUser.uid],
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
        onError: (_error, _, context) => {
            if (context?.previousBacklog) {
                queryClient.setQueryData(
                    ["backlog", authUser.uid],
                    context.previousBacklog
                );
            }
        },
        onSettled: (_data, _error) => {
            queryClient.invalidateQueries({ 
                queryKey: ["backlog", authUser.uid]
            });
        }
    });
};
