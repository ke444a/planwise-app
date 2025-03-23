import { View, Text, TouchableOpacity } from "react-native";
import tw from "twrnc";
import { Ionicons } from "@expo/vector-icons";
import { GeneratedActivityItem } from "./GeneratedActivityItem";
import Animated, { 
    FadeIn,
    FadeInDown
} from "react-native-reanimated";
import { useState, useCallback } from "react";
import { useAddActivityToScheduleMutation } from "@/api/schedules/addActivityToSchedule";
import { useAddItemToBacklogMutation } from "@/api/backlogs/addItemToBacklog";
import { useAppContext } from "@/context/AppContext";
import { NotificationModal } from "@/components/ui/NotificationModal";

interface Props {
    activities: IActivity[];
    date: Date;
    staminaUsed: number;
    userMaxStamina: number;
    onAddStaminaUsed: (_stamina: number) => void;
}
type GeneratedActivityItemStatus = "idle" | "added" | "removed" | "backlog";

const ModelActivityBox = ({ 
    activities, 
    date, 
    userMaxStamina, 
    staminaUsed, 
    onAddStaminaUsed }: Props
) => {
    // Mutations
    const { mutateAsync: addActivityToSchedule } = useAddActivityToScheduleMutation();
    const { mutate: addItemToBacklog } = useAddItemToBacklogMutation();

    const { setError } = useAppContext();
    const [tasksAdded, setTasksAdded] = useState(0);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const percentageStaminaUsed = userMaxStamina > 0 ? staminaUsed / userMaxStamina : 0;
    const totalTasks = Array.isArray(activities) ? activities.length : 0;
    const [activitiesStatus, setActivitiesStatus] = useState<GeneratedActivityItemStatus[]>(Array(totalTasks).fill("idle"));

    const handleAddToSchedule = useCallback(async (index: number) => {
        try {
            const activityToAdd = activities[index];
            const totalStaminaUsed = staminaUsed + activityToAdd.staminaCost;
            if (userMaxStamina > 0 && totalStaminaUsed / userMaxStamina > 1.2) {
                setIsModalVisible(true);
                return;
            }

            await addActivityToSchedule({
                activity: activityToAdd,
                date: date
            });
            setActivitiesStatus(prev => {
                const newStatus = [...prev];
                newStatus[index] = "added";
                return newStatus;
            });
            onAddStaminaUsed(activityToAdd.staminaCost);
            setTasksAdded(prev => prev + 1);
        } catch (error) {
            setError({
                message: "Failed to add activity to schedule",
                code: "add-activity-to-schedule-failed",
                error
            });
        }
    }, [activities, date, addActivityToSchedule, onAddStaminaUsed, setError, staminaUsed, userMaxStamina]);

    const handleRemove = useCallback((index: number) => {
        setActivitiesStatus(prev => {
            const newStatus = [...prev];
            newStatus[index] = "removed";
            return newStatus;
        });
    }, []);

    const handleAddToBacklog = useCallback((index: number) => {
        addItemToBacklog({
            item: {
                ...activities[index],
                itemType: "activity"
            }
        }, {
            onSuccess: () => {
                setActivitiesStatus(prev => {
                    const newStatus = [...prev];
                    newStatus[index] = "backlog";
                    return newStatus;
                });
            },
            onError: (error) => {
                setError({
                    message: "Failed to add activity to backlog",
                    code: "add-activity-to-backlog-failed",
                    error
                });
            }
        });
    }, [activities, addItemToBacklog, setError]);

    const handleSaveAll = useCallback(() => {        
        const idleActivityIndices = activitiesStatus.reduce<number[]>((acc, status, index) => {
            if (status === "idle") {
                acc.push(index);
            }
            return acc;
        }, []);

        Promise.all(idleActivityIndices.map(index => handleAddToSchedule(index)));
    }, [activitiesStatus, handleAddToSchedule]);

    return (
        <View style={tw`py-4 mb-6`}>
            {/* Header with stats */}
            <Animated.View 
                style={tw`flex-row justify-between items-start mb-4`}
                entering={FadeIn.duration(400)}
            >
                <View style={tw`flex-col gap-y-2`}>
                    <View style={tw`flex-row items-center`}>
                        <Ionicons name="checkbox" size={20} style={tw`mr-1 text-gray-950`} />
                        <Text style={tw`text-gray-950 font-medium`}>{tasksAdded}/{totalTasks} tasks added</Text>
                    </View>
                    <View style={tw`flex-row items-center`}>
                        <Ionicons name="flash" size={20} style={tw.style("mr-1 text-gray-950", percentageStaminaUsed > 0.8 && "text-orange-400", percentageStaminaUsed > 0.95 && "text-red-400")} />
                        <Text style={
                            tw.style(
                                "font-medium text-gray-950",
                                percentageStaminaUsed > 0.8 && "text-orange-400 underline",
                                percentageStaminaUsed > 0.95 && "text-red-400 underline"
                            )
                        }>{staminaUsed}/{userMaxStamina} stamina used</Text>
                    </View>
                </View>
                <TouchableOpacity 
                    onPress={handleSaveAll}
                    style={tw`flex-row items-center`}
                >
                    <Ionicons name="checkmark-done" size={20} style={tw`text-rose-500 mr-1`} />
                    <Text style={tw`text-rose-500 font-medium`}>Save All</Text>
                </TouchableOpacity>
            </Animated.View>
            <View style={tw`gap-4`}>
                {Array.isArray(activities) && activities.map((activity, index) => (
                    <Animated.View 
                        key={activity.id || index}
                        entering={FadeInDown.duration(400).delay(300 + (index * 150))}
                    >
                        <GeneratedActivityItem 
                            activity={activity}
                            status={activitiesStatus[index]}
                            onAddToSchedule={() => handleAddToSchedule(index)}
                            onRemove={() => handleRemove(index)}
                            onAddToBacklog={() => handleAddToBacklog(index)}
                        />
                    </Animated.View>
                ))}
            </View>

            <NotificationModal
                isVisible={isModalVisible}
                onClose={() => setIsModalVisible(false)}
            />
        </View>
    );
};

export default ModelActivityBox;