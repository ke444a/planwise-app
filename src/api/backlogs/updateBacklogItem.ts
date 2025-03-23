import { getFirestore, doc, updateDoc } from "@react-native-firebase/firestore";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";

const updateBacklogItem = async (item: IBacklogItem, uid: string) => {
    const db = getFirestore();
    const backlogItemRef = doc(db, "backlog", uid, "items", item.id!);

    const updateData = {
        title: item.title,
        duration: item.duration,
        subtasks: item.subtasks,
        updatedAt: new Date(),
        ...(item.itemType === "activity" && {
            type: item.type,
            priority: item.priority,
            startTime: item.startTime,
            endTime: item.endTime,
            staminaCost: item.staminaCost,
        }),
    };

    await updateDoc(backlogItemRef, updateData);
    return item;
};

export const useUpdateBacklogItemMutation = () => {
    const { authUser } = useAuth();
    if (!authUser) {
        throw new Error("User not authenticated");
    }
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (item: IBacklogItem) => updateBacklogItem(item, authUser.uid),
        onMutate: async (item) => {
            const queryKey = ["backlog", authUser.uid];
            await queryClient.cancelQueries({ queryKey });

            const previousItems = queryClient.getQueryData<IBacklogItem[]>(queryKey) ?? [];

            queryClient.setQueryData(queryKey, (old: IBacklogItem[] | undefined) => {
                if (old) {
                    return old.map(oldItem => oldItem.id === item.id ? item : oldItem);
                }
                return [item];
            });

            return { previousItems, queryKey };
        },
        onError: (_err, _, context) => {
            if (context) {
                queryClient.setQueryData(context.queryKey, context.previousItems);
            }
        },
        onSettled: (_data, _error) => {
            queryClient.invalidateQueries({ queryKey: ["backlog", authUser.uid] });
        },
    });
}; 