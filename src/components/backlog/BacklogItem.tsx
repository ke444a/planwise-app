import { View, Text, TouchableOpacity } from "react-native";
import tw from "twrnc";
import Feather from "@expo/vector-icons/Feather";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { getActivityDurationLabel } from "@/utils/getActivityDurationLabel";
import { IBacklogItem } from "@/api/backlog/addItemToBacklog";
import ActivityIcon from "@/components/ui/ActivityIcon";

interface BacklogItemProps {
    item: IBacklogItem;
    onComplete?: (_id: string) => void;
}

export const BacklogItem = ({ item, onComplete }: BacklogItemProps) => {
    const renderIcon = () => {
        if (item.itemType === "draft") {
            return (
                <MaterialCommunityIcons name="text-box-outline" size={24} style={tw`text-gray-600 mr-3`} />
            );
        }

        return (
            <View style={tw`mr-3`}>
                <ActivityIcon 
                    activityType={item.type} 
                    activityPriority={item.priority} 
                    iconSize={24} 
                />
            </View>
        );
    };

    return (
        <View style={tw`flex-row items-center p-4 bg-white rounded-xl mb-3`}>
            {renderIcon()}
            <View style={tw`flex-1`}>
                <Text style={tw`text-gray-950 text-lg font-medium max-w-[80%] shrink`}>
                    {item.title}
                </Text>
                <Text style={tw`text-gray-500 mt-1`}>
                    {getActivityDurationLabel(item.duration)}
                </Text>
            </View>
            <TouchableOpacity 
                style={tw`h-6 w-6 rounded-full border-2 border-gray-500 items-center justify-center`}
                onPress={() => onComplete?.(item.id!)}
            >
                {item.isCompleted && (
                    <Feather name="check" size={16} style={tw`text-purple-400`} />
                )}
            </TouchableOpacity>
        </View>
    );
}; 