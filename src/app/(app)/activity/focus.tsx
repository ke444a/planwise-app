import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import tw from "twrnc";
import { useGetActivityFromScheduleQuery } from "@/api/schedules/getActivityFromSchedule";
import { useCompleteActivityMutation } from "@/api/schedules/completeActivity";
import ActivityIcon from "@/components/activity/ActivityIcon";
import { ButtonWithIcon } from "@/components/ui/ButtonWithIcon";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { SafeAreaView } from "react-native-safe-area-context";

const FocusScreen = () => {
    const router = useRouter();
    const { activityId, activityDate } = useLocalSearchParams<{
        activityId: string;
        activityDate: string;
    }>();
    const parsedDate = new Date(activityDate);
    const { data: activity } = useGetActivityFromScheduleQuery(activityId, parsedDate);
    const { mutate: completeActivity } = useCompleteActivityMutation();
    const [timeRemaining, setTimeRemaining] = useState("");
    const [subtasks, setSubtasks] = useState(activity?.subtasks || []);

    useEffect(() => {
        if (activity?.subtasks) {
            setSubtasks(activity.subtasks);
        }
    }, [activity]);

    useEffect(() => {
        const calculateTimeRemaining = () => {
            if (!activity?.endTime) return;

            const [hours, minutes] = activity.endTime.split(":").map(Number);
            const endTime = new Date();
            endTime.setHours(hours, minutes, 0);

            const now = new Date();
            const diff = endTime.getTime() - now.getTime();

            if (diff <= 0) {
                router.back();
                return;
            }

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
    }, [activity, router]);

    const toggleSubtask = (index: number) => {
        const newSubtasks = [...subtasks];
        newSubtasks[index] = {
            ...newSubtasks[index],
            isCompleted: !newSubtasks[index].isCompleted
        };
        setSubtasks(newSubtasks);
    };

    const handleComplete = async () => {
        if (!activityId || !parsedDate) return;
        completeActivity({
            activityId,
            date: parsedDate,
            isCompleted: true
        });
        router.back();
    };

    if (!activity) return null;

    return (
        <SafeAreaView style={tw`flex-1 bg-purple-50 px-4 pt-8`}>
            <Text style={tw`text-2xl text-center mb-4`}>Time Remaining</Text>
            <Text style={tw`text-6xl font-semibold text-center mb-12`}>{timeRemaining}</Text>
            
            <View style={tw`flex-1`}>
                <View style={tw`bg-white rounded-3xl mb-3 justify-center items-center w-36 h-36 mx-auto`}>
                    <ActivityIcon 
                        activityType={activity.type}
                        activityPriority={activity.priority}
                        iconSize={100}
                    />
                </View>
                <Text style={tw`text-2xl font-semibold text-center mb-20`}>{activity.title}</Text>
                {subtasks.length > 0 && (
                    <View style={tw`flex-1 border-t border-gray-200`}>
                        <ScrollView style={tw`flex-1`}>
                            {subtasks.map((subtask, index) => (
                                <TouchableOpacity
                                    key={index}
                                    onPress={() => toggleSubtask(index)}
                                    style={tw`flex-row items-center mb-4`}
                                >
                                    <View style={tw`w-6 h-6 rounded-full border-2 border-gray-300 items-center justify-center mr-3`}>
                                        {subtask.isCompleted && (
                                            <View style={tw`w-3 h-3 rounded-full bg-gray-300`} />
                                        )}
                                    </View>
                                    <Text style={[
                                        tw`text-lg`,
                                        subtask.isCompleted && tw`line-through text-gray-400`
                                    ]}>
                                        {subtask.title}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                )}
            </View>
            <ButtonWithIcon
                label={subtasks.length > 0 ? "Complete All" : "Complete"}
                onPress={handleComplete}
                iconPosition="left"
                fullWidth
                icon={<MaterialCommunityIcons name="checkbox-multiple-marked" size={24} style={tw`text-gray-950`} />}
            />
        </SafeAreaView>
    );
};

export default FocusScreen;