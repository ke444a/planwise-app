import { getFirestore, doc, updateDoc } from "@react-native-firebase/firestore";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { IBacklogItem } from "./addItemToBacklog";

interface UpdateBacklogItemParams {
    item: IBacklogItem;
    uid: string;
}

const updateBacklogItem = async ({ item, uid }: UpdateBacklogItemParams) => {
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
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updateBacklogItem,
        onMutate: async ({ item, uid }) => {
            const queryKey = ["backlog", uid];
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
        onError: (_err, _variables, context) => {
            if (context) {
                queryClient.setQueryData(context.queryKey, context.previousItems);
            }
        },
        onSettled: (_data, _error, variables) => {
            queryClient.invalidateQueries({ queryKey: ["backlog", variables.uid] });
        },
    });
}; 