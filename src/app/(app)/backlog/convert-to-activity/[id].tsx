import { View, Text } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import tw from "twrnc";
import { TouchableOpacity } from "react-native";
import AntDesign from "@expo/vector-icons/AntDesign";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useState } from "react";
import { useGetBacklogItemQuery } from "@/api/backlogs/getBacklogItem";
import { useDeleteItemFromBacklogMutation } from "@/api/backlogs/deleteItemFromBacklog";
import { useAddActivityToScheduleMutation } from "@/api/schedules/addActivityToSchedule";
import ScreenWrapper from "@/components/ui/ScreenWrapper";
import { BacklogItemActivityForm } from "@/components/backlog";
import { useGetUserQuery } from "@/api/users/getUser";
import { useGetScheduleForDayQuery } from "@/api/schedules/getScheduleForDay";
import { NotificationModal } from "@/components/ui/NotificationModal";
import { AiSuggestionButton } from "@/components/activity/AiSuggestionButton";
import { Toast } from "@/components/ui/Toast";
import { addMinutesToTime } from "@/utils/addMinutesToTime";

type ActivityDetails = Omit<IActivity, "isCompleted" | "id">;

const ConvertToActivityScreen = () => {
    const { id } = useLocalSearchParams();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const { data: item, isPending } = useGetBacklogItemQuery(id as string);
    const { mutate: deleteFromBacklog } = useDeleteItemFromBacklogMutation();
    const { mutate: addToSchedule } = useAddActivityToScheduleMutation();
    const [activityDetails, setActivityDetails] = useState<ActivityDetails | null>(null);
    const { data: userData } = useGetUserQuery();
    const { data: scheduleData } = useGetScheduleForDayQuery(selectedDate);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [showToast, setShowToast] = useState(false);

    const handleClose = () => {
        router.back();
    };

    const handleAiSuggestion = (suggestion: IActivity) => {
        setActivityDetails(prev => ({
            ...prev!,
            type: suggestion.type,
            duration: suggestion.duration,
            priority: suggestion.priority,
            staminaCost: suggestion.staminaCost,
            subtasks: suggestion.subtasks,
            startTime: prev!.startTime,
            endTime: addMinutesToTime(prev!.startTime, suggestion.duration)
        }));
    };

    const handleAddToSchedule = () => {
        if (!activityDetails?.title.trim() || !id || !item) return;
        if (!userData || !scheduleData) return;

        const activity: IActivity = {
            ...activityDetails,
            title: activityDetails.title.trim(),
            isCompleted: false,
        };

        const currentStamina = scheduleData.reduce((acc, activity) => acc + activity.staminaCost, 0);
        const totalStaminaUsed = currentStamina + activity.staminaCost;
        if (userData.maxStamina > 0 && totalStaminaUsed / userData.maxStamina > 1.2) {
            setIsModalVisible(true);
            return;
        }

        addToSchedule({ 
            activity, 
            date: selectedDate
        }, {
            onSuccess: () => {
                deleteFromBacklog({ 
                    id: id as string
                });
                router.back();
            }
        });
    };

    if (isPending || !item) {
        return null;
    }

    return (
        <ScreenWrapper>
            <View style={tw`flex-row justify-between items-center px-4 py-6`}>
                <View style={tw`flex-row items-center gap-x-2`}>
                    <TouchableOpacity onPress={handleClose}>
                        <AntDesign name="closecircle" size={24} style={tw`text-gray-500`} />
                    </TouchableOpacity>
                    <Text style={tw`text-2xl font-semibold`}>Add to Schedule</Text>
                </View>
                <AiSuggestionButton
                    title={activityDetails?.title}
                    onSuggestion={handleAiSuggestion}
                    onShowToast={() => setShowToast(true)}
                />
            </View>

            <BacklogItemActivityForm
                initialData={item}
                showDatePicker={true}
                onActivityDetailsChange={setActivityDetails}
                selectedDate={selectedDate}
                onDateChange={setSelectedDate}
                submitButtonLabel="Add to Schedule"
                submitButtonIcon={<Ionicons name="calendar" size={24} style={tw`text-gray-950`} />}
                onSubmit={handleAddToSchedule}
            />

            <NotificationModal
                isVisible={isModalVisible}
                onClose={() => setIsModalVisible(false)}
            />

            <Toast
                message="Please provide a title first to use AI auto-completion"
                isVisible={showToast}
                onHide={() => setShowToast(false)}
            />
        </ScreenWrapper>
    );
};

export default ConvertToActivityScreen;