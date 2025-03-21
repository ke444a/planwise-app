import { View, Text, TouchableOpacity } from "react-native";
import tw from "twrnc";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import Feather from "@expo/vector-icons/Feather";
import AntDesign from "@expo/vector-icons/AntDesign";
import { getActivityDurationLabel } from "@/utils/getActivityDurationLabel";
import ActivityIcon from "../activity/ActivityIcon";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useUserStore } from "@/libs/userStore";
import { useTickBacklogItemSubtaskMutation } from "@/api/backlogs/tickBacklogItemSubtask";
import LiftedBottomModal from "@/components/ui/LiftedBottomModal";

interface BacklogItemDetailsModalProps {
    item: IBacklogItem;
    visible: boolean;
    onClose: () => void;
    onDelete: () => void;
    onEdit: () => void;
    onComplete: () => void;
    onAddToSchedule: () => void;
}

const BacklogItemDetailsModal = ({ 
    item,
    visible,
    onClose,
    onDelete,
    onEdit,
    onComplete,
    onAddToSchedule
}: BacklogItemDetailsModalProps) => {
    const { user } = useUserStore();
    const { mutate: tickSubtask } = useTickBacklogItemSubtaskMutation();

    const handleSubtaskPress = (subtaskId: string, isCompleted: boolean) => {
        if (!user) return;
        tickSubtask({
            uid: user.uid,
            itemId: item.id!,
            subtaskId: subtaskId,
            isCompleted: !isCompleted,
        });
    };

    return (
        <LiftedBottomModal visible={visible} onClose={onClose}>
            <View style={tw`px-4`}>
                <View style={tw`flex-row justify-between py-6 border-b border-gray-200`}>
                    <View style={tw`flex-row items-center gap-x-2`}>
                        {item.itemType === "draft" ? (
                            <MaterialCommunityIcons 
                                name="text-box-outline" 
                                size={50} 
                                style={tw`text-gray-600`} 
                            />
                        ) : (
                            <ActivityIcon 
                                activityType={item.type}
                                activityPriority={item.priority}
                                iconSize={50}
                            />
                        )}
                        <View style={tw`flex-col`}> 
                            <Text style={tw`text-gray-500 text-base`}>
                                {getActivityDurationLabel(item.duration)}
                            </Text>
                            <Text style={tw`text-2xl font-semibold text-gray-950`}>{item.title}</Text>
                        </View>
                    </View>
                    <TouchableOpacity onPress={onClose}>
                        <AntDesign name="closecircle" size={20} style={tw`text-gray-400`} />
                    </TouchableOpacity>
                </View>

                {/* Subtasks */}
                {item.subtasks && item.subtasks.length > 0 && (
                    <View style={tw`border-b border-gray-200 py-5`}>
                        {item.subtasks.map((subtask) => (
                            <TouchableOpacity 
                                key={subtask.id} 
                                style={tw`flex-row items-center mb-2`}
                                onPress={() => handleSubtaskPress(subtask.id, subtask.isCompleted)}
                            >
                                <View style={tw`w-6 h-6 rounded-lg border-2 border-gray-600 items-center justify-center mr-2`}>
                                    {subtask.isCompleted && (
                                        <Ionicons name="checkmark" size={16} style={tw`text-gray-600`} />
                                    )}
                                </View>
                                <Text style={[
                                    tw`text-base`,
                                    subtask.isCompleted && tw`line-through text-gray-600`
                                ]}>
                                    {subtask.title}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                {/* Action Buttons */}
                <View style={tw`py-5`}>
                    {/* Top row buttons */}
                    <View style={tw`flex-row gap-x-2 mb-2`}>
                        <TouchableOpacity 
                            style={tw`flex-1 py-3 bg-slate-200 rounded-xl items-center justify-center`}
                            onPress={onDelete}
                        >
                            <MaterialCommunityIcons name="trash-can-outline" size={20} style={tw`text-gray-950`} />
                            <Text style={tw`text-gray-950 font-medium mt-1`}>Delete</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={tw`flex-1 py-3 bg-slate-200 rounded-xl items-center justify-center`}
                            onPress={onEdit}
                        >
                            <Feather name="edit" size={20} style={tw`text-gray-950`} />
                            <Text style={tw`text-gray-950 font-medium mt-1`}>Edit</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={tw`flex-1 py-3 bg-slate-200 rounded-xl items-center justify-center`}
                            onPress={onComplete}
                        >
                            {item.isCompleted ? (
                                <MaterialCommunityIcons name="close-circle" size={20} style={tw`text-gray-950`} />
                            ) : (
                                <MaterialCommunityIcons name="check-circle" size={20} style={tw`text-gray-950`} />
                            )}
                            <Text style={tw`text-gray-950 font-medium mt-1`}>
                                {item.isCompleted ? "Undo" : "Complete"}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Add to Schedule button */}
                    <TouchableOpacity 
                        style={tw`flex-row items-center justify-center py-3 bg-purple-200 rounded-xl`}
                        onPress={onAddToSchedule}
                    >
                        <MaterialCommunityIcons name="calendar-plus" size={20} style={tw`text-gray-950 mr-2`} />
                        <Text style={tw`text-gray-950 font-medium`}>Add to Schedule</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </LiftedBottomModal>
    );
};

export default BacklogItemDetailsModal;