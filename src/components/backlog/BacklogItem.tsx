import { View, Text, TouchableOpacity } from "react-native";
import tw from "twrnc";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { getActivityDurationLabel } from "@/utils/getActivityDurationLabel";
import ActivityIcon from "@/components/activity/ActivityIcon";
import { useState } from "react";
import BacklogItemDetailsModal from "./BacklogItemDetailsModal";
import Ionicons from "@expo/vector-icons/Ionicons";

interface BacklogItemProps {
    item: IBacklogItem;
    onComplete: (_item: IBacklogItem) => void;
    onDelete: (_id: string) => void;
    onEdit: (_id: string) => void;
    onAddToSchedule: (_id: string) => void;
    testID?: string;
}

const BacklogItem = ({ 
    item, 
    onComplete,
    onDelete,
    onEdit,
    onAddToSchedule,
    testID
}: BacklogItemProps) => {
    const [isModalVisible, setIsModalVisible] = useState(false);

    const renderIcon = (isCompleted: boolean) => {
        if (item.itemType === "draft") {
            return (
                <MaterialCommunityIcons 
                    name="text-box-outline" 
                    size={32} 
                    style={tw`text-gray-600 mr-3 ${isCompleted ? "opacity-70" : ""}`} 
                />
            );
        }

        return (
            <View style={tw`mr-3 ${isCompleted ? "opacity-70" : ""}`}>
                <ActivityIcon 
                    activityType={item.type} 
                    activityPriority={item.priority} 
                    iconSize={32} 
                />
            </View>
        );
    };

    return (
        <>
            <TouchableOpacity 
                style={tw`flex-row items-center p-4 bg-white rounded-xl mb-3`}
                onPress={() => setIsModalVisible(true)}
                testID={testID}
            >
                {renderIcon(item.isCompleted)}
                <View style={tw`flex-1`}>
                    <Text style={[
                        tw`text-gray-950 text-lg font-medium max-w-[80%] shrink`,
                        item.isCompleted && tw`line-through opacity-70`
                    ]}>
                        {item.title}
                    </Text>
                    <Text style={tw`text-gray-500 mt-1`}>
                        {getActivityDurationLabel(item.duration)}
                    </Text>
                </View>
                
                {/* Completion checkmark on the right */}
                <View>
                    <TouchableOpacity 
                        style={[
                            tw`w-[24px] h-[24px] rounded-full items-center justify-center border-2`,
                            item.isCompleted ? tw`bg-gray-600 border-gray-600` : tw`border-gray-500`
                        ]}
                        onPress={() => onComplete(item)}
                    >
                        {item.isCompleted && (
                            <Ionicons name="checkmark" size={20} style={tw`text-white`} testID="backlog-item-checkmark" />
                        )}
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>

            <BacklogItemDetailsModal
                item={item}
                visible={isModalVisible}
                onClose={() => setIsModalVisible(false)}
                onComplete={() => {
                    onComplete(item);
                    setIsModalVisible(false);
                }}
                onDelete={() => {
                    onDelete(item.id!);
                    setIsModalVisible(false);
                }}
                onEdit={() => {
                    onEdit(item.id!);
                    setIsModalVisible(false);
                }}
                onAddToSchedule={() => {
                    onAddToSchedule(item.id!);
                    setIsModalVisible(false);
                }}
            />
        </>
    );
};

export default BacklogItem;