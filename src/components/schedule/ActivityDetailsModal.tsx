import { View, Text, Modal, TouchableOpacity } from "react-native";
import tw from "twrnc";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Feather from "@expo/vector-icons/Feather";
import { getActivityDurationLabel } from "@/utils/getActivityDurationLabel";
import { timeToMinutes } from "@/utils/timeToMinutes";
import ActivityIcon from "../ui/ActivityIcon";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useRouter } from "expo-router";
import { useUserStore } from "@/config/userStore";
import { useTickActivitySubtaskMutation } from "@/api/schedules/tickActivitySubtask";

interface ActivityDetailsModalProps {
    activity: IActivity;
    visible: boolean;
    onClose: () => void;
    onDelete: () => void;
    onEdit: () => void;
    onComplete: () => void;
    onMoveToBacklog: () => void;
}

const getIsCurrentActivity = (startTime: string, endTime: string): boolean => {
    const now = new Date();
    const currentHours = now.getHours();
    const currentMinutes = now.getMinutes();
    const currentTotalMinutes = currentHours * 60 + currentMinutes;
    
    const startTotalMinutes = timeToMinutes(startTime);
    const endTotalMinutes = timeToMinutes(endTime);
    return currentTotalMinutes >= startTotalMinutes && currentTotalMinutes < endTotalMinutes;
};

const ActivityDetailsModal = ({ 
    activity,
    visible,
    onClose,
    onDelete,
    onEdit,
    onComplete,
    onMoveToBacklog
}: ActivityDetailsModalProps) => {
    const { user } = useUserStore();
    const router = useRouter();
    const isCurrentActivity = getIsCurrentActivity(activity.startTime, activity.endTime);
    const { mutate: tickSubtask } = useTickActivitySubtaskMutation();

    const handleFocusNow = () => {
        if (!user?.uid) return;
        onClose();
        router.push({
            pathname: "/focus",
            params: {
                activityId: activity.id,
                date: new Date().toISOString(),
                uid: user.uid
            }
        });
    };

    const handleSubtaskPress = (subtaskId: string, isCompleted: boolean) => {
        if (!user) return;
        tickSubtask({
            uid: user.uid,
            date: new Date(),
            activityId: activity.id!,
            subtaskId: subtaskId,
            isCompleted: !isCompleted,
        });
    };

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={tw`flex-1 justify-end bg-black/30`}>
                <View style={tw`bg-white rounded-3xl mx-4 mb-12 shadow-lg px-4`}>
                    <View style={tw`flex-row justify-between py-6 border-b border-gray-200`}>
                        <View style={tw`flex-row items-center gap-x-3`}>
                            <ActivityIcon 
                                activityType={activity.type}
                                activityPriority={activity.priority}
                                iconSize={50}
                            />
                            <View style={tw`flex-col`}> 
                                <Text style={tw`text-gray-500 text-base`}>
                                    {activity.startTime}-{activity.endTime} ({getActivityDurationLabel(activity.duration)})
                                </Text>
                                <Text style={tw`text-2xl font-semibold`}>{activity.title}</Text>
                            </View>
                        </View>
                        <TouchableOpacity onPress={onClose}>
                            <AntDesign name="closecircle" size={20} style={tw`text-gray-400`} />
                        </TouchableOpacity>
                    </View>

                    {/* Subtasks */}
                    {activity.subtasks && activity.subtasks.length > 0 && (
                        <View style={tw`border-b border-gray-200 py-5`}>
                            {activity.subtasks.map((subtask) => (
                                <TouchableOpacity 
                                    key={subtask.id} 
                                    style={tw`flex-row items-center mb-2`}
                                    onPress={() => handleSubtaskPress(subtask.id, subtask.isCompleted)}
                                >
                                    <View style={tw`w-6 h-6 rounded-full border-2 border-gray-300 items-center justify-center mr-2`}>
                                        {subtask.isCompleted && (
                                            <Ionicons name="checkmark" size={16} style={tw`text-gray-300`} />
                                        )}
                                    </View>
                                    <Text style={[
                                        tw`text-base`,
                                        subtask.isCompleted && tw`line-through text-gray-400`
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
                                style={tw`flex-1 py-3 bg-gray-100 rounded-xl items-center justify-center`}
                                onPress={onDelete}
                            >
                                <MaterialCommunityIcons name="trash-can-outline" size={20} style={tw`text-gray-950`} />
                                <Text style={tw`text-gray-950 font-medium mt-1`}>Delete</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={tw`flex-1 py-3 bg-gray-100 rounded-xl items-center justify-center`}
                                onPress={onEdit}
                            >
                                <Feather name="edit" size={20} style={tw`text-gray-950`} />
                                <Text style={tw`text-gray-950 font-medium mt-1`}>Edit</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={tw`flex-1 py-3 bg-gray-100 rounded-xl items-center justify-center`}
                                onPress={onComplete}
                            >
                                {activity.isCompleted ? (
                                    <MaterialIcons name="remove-done" size={20} style={tw`text-gray-950`} />
                                ) : (
                                    <MaterialIcons name="check-circle" size={20} style={tw`text-gray-950`} />
                                )}
                                <Text style={tw`text-gray-950 font-medium mt-1`}>
                                    {activity.isCompleted ? "Undo" : "Complete"}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* Move to Backlog button */}
                        <TouchableOpacity 
                            style={tw`flex-row items-center justify-center py-3 bg-gray-100 rounded-xl mb-2`}
                            onPress={onMoveToBacklog}
                        >
                            <Ionicons name="archive-outline" size={20} style={tw`text-gray-950 mr-2`} />
                            <Text style={tw`text-gray-950 font-medium`}>Move to Backlog</Text>
                        </TouchableOpacity>

                        {/* Focus now button */}
                        {!activity.isCompleted && isCurrentActivity && (
                            <TouchableOpacity 
                                style={tw`flex-row items-center justify-center py-3 bg-red-200 rounded-xl`}
                                onPress={handleFocusNow}
                            >
                                <MaterialCommunityIcons name="timer-sand" size={20} style={tw`text-gray-950 mr-2`} />
                                <Text style={tw`text-gray-950 font-medium`}>Focus now</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </View>
        </Modal>
    );
};

export default ActivityDetailsModal;