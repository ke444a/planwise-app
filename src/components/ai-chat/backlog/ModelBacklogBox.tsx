import { View, Text, TouchableOpacity } from "react-native";
import tw from "twrnc";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { GeneratedBacklogItem } from "./GeneratedBacklogItem";
import { getActivityDurationLabel } from "@/utils/getActivityDurationLabel";
import { useState, useCallback } from "react";
import { useAddItemToBacklogMutation } from "@/api/backlogs/addItemToBacklog";
import { createNewSubtask } from "@/utils/createNewSubtask";
import { useAppContext } from "@/context/AppContext";
import Animated, { 
    FadeIn,
    FadeInDown
} from "react-native-reanimated";

interface Props {
    items: IBacklogItemGenAI[];
}

type GeneratedBacklogItemStatus = "idle" | "added" | "removed";

const ModelBacklogBox = ({ items }: Props) => {
    const { mutateAsync: addItemToBacklog } = useAddItemToBacklogMutation();
    const { setError } = useAppContext();
    const [itemsAdded, setItemsAdded] = useState(0);
    const totalItems = Array.isArray(items) ? items.length : 0;
    const [itemsStatus, setItemsStatus] = useState<GeneratedBacklogItemStatus[]>(Array(totalItems).fill("idle"));
    
    const totalDuration = Array.isArray(items) 
        ? items.reduce((acc, item) => acc + (item.estimated_duration || 0), 0)
        : 0;

    const handleAdd = useCallback(async (index: number) => {
        try {
            const formattedSubtasks = items[index].subtasks 
                ? items[index].subtasks.map(subtask => createNewSubtask(subtask))
                : [];

            await addItemToBacklog({
                item: {
                    title: items[index].title,
                    duration: items[index].estimated_duration,
                    itemType: "draft",
                    subtasks: formattedSubtasks,
                    isCompleted: false
                }
            });
            setItemsStatus(prev => {
                const newStatus = [...prev];
                newStatus[index] = "added";
                return newStatus;
            });
            setItemsAdded(prev => prev + 1);
        } catch (error) {
            setError({
                message: "Failed to add item to backlog",
                code: "add-item-to-backlog-failed",
                error
            });
        }
    }, [items, addItemToBacklog, setError]);

    const handleRemove = useCallback((index: number) => {
        setItemsStatus(prev => {
            const newStatus = [...prev];
            newStatus[index] = "removed";
            return newStatus;
        });
    }, []);

    const handleSaveAll = useCallback(() => {
        const idleItemIndices = itemsStatus.reduce<number[]>((acc, status, index) => {
            if (status === "idle") {
                acc.push(index);
            }
            return acc;
        }, []);

        Promise.all(idleItemIndices.map(index => handleAdd(index)));
    }, [itemsStatus, handleAdd]);

    return (
        <View style={tw`py-4 mb-6`}>
            {/* Header with stats */}
            <Animated.View 
                style={tw`flex-row justify-between items-start mb-4`}
                entering={FadeIn.duration(400)}
            >
                <View style={tw`flex-col gap-y-2`}>
                    <View style={tw`flex-row items-center`}>
                        <MaterialIcons name="library-add-check" size={20} style={tw`mr-1 text-gray-950`} />
                        <Text style={tw`text-gray-950 font-medium`}>{itemsAdded}/{totalItems} items added</Text>
                    </View>
                    <View style={tw`flex-row items-center`}>
                        <Ionicons name="time-outline" size={20} style={tw`mr-1 text-gray-950`} />
                        <Text style={tw`font-medium text-gray-950`}>{getActivityDurationLabel(totalDuration)} total</Text>
                    </View>
                </View>
                {items && items.length > 0 && (
                    <TouchableOpacity 
                        onPress={handleSaveAll}
                        style={tw`flex-row items-center`}
                    >
                        <Ionicons name="checkmark-done" size={20} style={tw`text-rose-500 mr-1`} />
                        <Text style={tw`text-rose-500 font-medium`}>Save All</Text>
                    </TouchableOpacity>
                )}
            </Animated.View>
            <View style={tw`gap-4`}>
                {Array.isArray(items) && items.length > 0 && items.map((item, index) => (
                    <Animated.View 
                        key={index}
                        entering={FadeInDown.duration(400).delay(300 + (index * 150))}
                    >
                        <GeneratedBacklogItem 
                            item={item}
                            status={itemsStatus[index]}
                            onAdd={() => handleAdd(index)}
                            onRemove={() => handleRemove(index)}
                        />
                    </Animated.View>
                ))}
            </View>
        </View>
    );
};

export default ModelBacklogBox; 