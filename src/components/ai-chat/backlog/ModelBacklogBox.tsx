import { View, Text, TouchableOpacity } from "react-native";
import tw from "twrnc";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { GeneratedBacklogItem } from "./GeneratedBacklogItem";
import { getActivityDurationLabel } from "@/utils/getActivityDurationLabel";
import { useState } from "react";
import { useUserStore } from "@/libs/userStore";
import { useAddItemToBacklogMutation } from "@/api/backlogs/addItemToBacklog";
import { createNewSubtask } from "@/utils/createNewSubtask";

interface Props {
    items: IBacklogItemGenAI[];
}

const ModelBacklogBox = ({ items }: Props) => {
    const { user } = useUserStore();
    const [addedItemIndices, setAddedItemIndices] = useState<Set<number>>(new Set());
    const [removedItemIndices, setRemovedItemIndices] = useState<Set<number>>(new Set());
    const { mutate: addItemToBacklog } = useAddItemToBacklogMutation();

    const totalItems = items?.length || 0;    
    const totalDuration = Array.isArray(items) 
        ? items.reduce((acc, item) => acc + (item.estimated_duration || 0), 0)
        : 0;

    const handleItemStateChange = (index: number, state: "added" | "removed") => {
        if (state === "added") {
            setAddedItemIndices(prev => new Set([...prev, index]));
        } else {
            setRemovedItemIndices(prev => new Set([...prev, index]));
        }
    };

    const handleSaveAll = async () => {
        if (!user?.uid || !items) return;

        const remainingItemsWithIndices = items
            .map((item, index) => ({ item, index }))
            .filter(({ index }) => 
                !addedItemIndices.has(index) && !removedItemIndices.has(index)
            );

        for (const { item } of remainingItemsWithIndices) {
            const formattedSubtasks = item.subtasks 
                ? item.subtasks.map(subtask => createNewSubtask(subtask))
                : [];
            addItemToBacklog({
                item: {
                    title: item.title,
                    duration: item.estimated_duration,
                    itemType: "draft",
                    subtasks: formattedSubtasks,
                    isCompleted: false
                },
                uid: user.uid
            });
        }
        
        // Use original indices when marking items as added
        const originalIndices = remainingItemsWithIndices.map(({ index }) => index);
        setAddedItemIndices(prev => new Set([...prev, ...originalIndices]));
    };

    return (
        <View style={tw`py-4 mb-6`}>
            {/* Header with stats */}
            <View style={tw`flex-row justify-between items-start mb-4`}>
                <View style={tw`flex-col gap-y-2`}>
                    <View style={tw`flex-row items-center`}>
                        <MaterialIcons name="library-add-check" size={20} style={tw`mr-1 text-gray-950`} />
                        <Text style={tw`text-gray-950 font-medium`}>{addedItemIndices.size}/{totalItems} items added</Text>
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
            </View>
            <View style={tw`gap-4`}>
                {Array.isArray(items) && items.length > 0 && items.map((item, index) => (
                    <GeneratedBacklogItem 
                        key={index}
                        item={item}
                        onStateChange={(state: "added" | "removed") => handleItemStateChange(index, state)}
                        isAdded={addedItemIndices.has(index)}
                    />
                ))}
            </View>
        </View>
    );
};

export default ModelBacklogBox; 