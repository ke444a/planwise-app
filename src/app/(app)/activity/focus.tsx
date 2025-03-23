import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useEffect, useState } from "react";
import { useLocalSearchParams, router } from "expo-router";
import tw from "twrnc";
import { useGetActivityFromScheduleQuery } from "@/api/schedules/getActivityFromSchedule";
import { useCompleteActivityMutation } from "@/api/schedules/completeActivity";
import { useTickActivitySubtaskMutation } from "@/api/schedules/tickActivitySubtask";
import ActivityIcon from "@/components/activity/ActivityIcon";
import { ButtonWithIcon } from "@/components/ui/ButtonWithIcon";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { LinearGradient } from "expo-linear-gradient";

const FocusScreen = () => {
    const { activityId, activityDate } = useLocalSearchParams<{
        activityId: string;
        activityDate: string;
    }>();
    const parsedDate = new Date(activityDate);
    const { data: activity } = useGetActivityFromScheduleQuery(activityId, parsedDate);
    const { mutate: completeActivity } = useCompleteActivityMutation();
    const { mutateAsync: tickSubtask } = useTickActivitySubtaskMutation();
    const [timeRemaining, setTimeRemaining] = useState("");
    const [subtasks, setSubtasks] = useState(activity?.subtasks || []);
    const [completionPercentage, setCompletionPercentage] = useState(0);

    useEffect(() => {
        if (activity?.subtasks) {
            setSubtasks(activity.subtasks);
        }
    }, [activity]);

    useEffect(() => {
        const calculateTimeRemaining = () => {
            if (!activity?.endTime || !activity?.startTime) return;

            const [endHours, endMinutes] = activity.endTime.split(":").map(Number);
            const [startHours, startMinutes] = activity.startTime.split(":").map(Number);
            
            const endTime = new Date();
            endTime.setHours(endHours, endMinutes, 0);
            
            const startTime = new Date();
            startTime.setHours(startHours, startMinutes, 0);
            
            const now = new Date();
            const diff = endTime.getTime() - now.getTime();
            const totalDuration = endTime.getTime() - startTime.getTime();

            if (diff <= 0) {
                router.back();
                return;
            }

            // Calculate completion percentage
            const elapsed = totalDuration - diff;
            const percentage = Math.max(0, Math.min(100, (elapsed / totalDuration) * 100));
            setCompletionPercentage(percentage);

            const hoursLeft = Math.floor(diff / (1000 * 60 * 60));
            const minutesLeft = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const secondsLeft = Math.floor((diff % (1000 * 60)) / 1000);

            setTimeRemaining(
                `${String(hoursLeft).padStart(2, "0")}:${String(minutesLeft).padStart(2, "0")}:${String(secondsLeft).padStart(2, "0")}`
            );
        };

        const timer = setInterval(calculateTimeRemaining, 1000);
        calculateTimeRemaining();

        return () => clearInterval(timer);
    }, [activity]);

    const toggleSubtask = async (subtaskId: string, isCompleted: boolean) => {
        if (!activityId || !parsedDate) return;
        
        await tickSubtask({
            date: parsedDate,
            activityId,
            subtaskId,
            isCompleted: !isCompleted
        });
    };

    const handleComplete = async () => {
        if (!activityId || !parsedDate) return;
        const incompleteSubtasks = subtasks.filter(subtask => !subtask.isCompleted);
        for (const subtask of incompleteSubtasks) {
            await tickSubtask({
                date: parsedDate,
                activityId,
                subtaskId: subtask.id,
                isCompleted: true
            });
        }
        
        completeActivity({
            activityId,
            date: parsedDate,
            isCompleted: true
        });
        router.back();
    };

    if (!activity) return null;

    return (
        <SafeAreaView style={tw`flex-1 px-4 pt-8`}>
            <LinearGradient
                colors={["#E9DAF1", "#E9DAF1", "#FFFFFF", "#FFFFFF"]} 
                locations={[
                    Math.max(0, (completionPercentage / 100) - 0.05), 
                    completionPercentage / 100,
                    Math.min(1, (completionPercentage / 100) + 0.05),
                    1
                ]}
                style={tw`absolute top-0 left-0 right-0 bottom-0`}
            />
            
            <Text style={tw`text-2xl text-center mb-4 font-medium text-gray-950`}>Time Remaining</Text>
            <Text style={tw`text-6xl font-semibold text-center mb-12 text-gray-950`}>{timeRemaining}</Text>
            
            <View style={tw`flex-1`}>
                <View style={tw`bg-white rounded-3xl mb-3 justify-center items-center w-36 h-36 mx-auto shadow-sm`}>
                    <ActivityIcon 
                        activityType={activity.type}
                        activityPriority={activity.priority}
                        iconSize={100}
                    />
                </View>
                <Text style={tw`text-2xl font-semibold text-center mb-14 text-gray-950`}>{activity.title}</Text>
                
                {subtasks.length > 0 && (
                    <View style={tw`flex-1 bg-white rounded-3xl p-8`}>
                        <View style={tw`flex-row gap-x-3 h-full`}>
                            <FontAwesome5 name="tasks" size={24} style={tw`text-gray-900`} />
                            <View style={tw`h-full w-[2px] bg-gray-400`} />
                            <ScrollView style={tw`flex-1`}>
                                {subtasks.map((subtask) => (
                                    <TouchableOpacity
                                        key={subtask.id}
                                        onPress={() => toggleSubtask(subtask.id, subtask.isCompleted)}
                                        style={tw`flex-row items-center mb-4`}
                                    >
                                        <View style={tw`w-6 h-6 rounded-lg border-2 border-gray-600 items-center justify-center mr-3`}>
                                            {subtask.isCompleted && (
                                                <Ionicons name="checkmark" size={20} style={tw`text-gray-600`} />
                                            )}
                                        </View>
                                        <Text style={[
                                            tw`text-lg text-gray-950`,
                                            subtask.isCompleted && tw`line-through text-gray-600`
                                        ]}>
                                            {subtask.title}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    </View>
                )}
            </View>
            <View style={tw`mt-6 mb-12`}>
                <ButtonWithIcon
                    label={subtasks.length > 0 ? "Complete All" : "Complete"}
                    onPress={handleComplete}
                    iconPosition="left"
                    fullWidth
                    variant="secondary"
                    icon={<MaterialCommunityIcons name="checkbox-multiple-marked" size={24} style={tw`text-gray-950`} />}
                />
            </View>
        </SafeAreaView>
    );
};

export default FocusScreen;