import { View, Text } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import tw from "twrnc";
import { TouchableOpacity } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useState } from "react";
import { useDeleteItemFromBacklogMutation } from "@/api/backlogs/deleteItemFromBacklog";
import { useAddActivityToScheduleMutation, ScheduleOverlapError } from "@/api/schedules/addActivityToSchedule";
import ScreenWrapper from "@/components/ui/ScreenWrapper";
import { BacklogItemActivityForm } from "@/components/backlog";
import { useGetUserQuery } from "@/api/users/getUser";
import { useGetScheduleForDayQuery } from "@/api/schedules/getScheduleForDay";
import { NotificationModal } from "@/components/ui/NotificationModal";
import { AiSuggestionButton } from "@/components/activity/AiSuggestionButton";
import { Toast } from "@/components/ui/Toast";
import { addMinutesToTime } from "@/utils/addMinutesToTime";
import { useAppContext } from "@/context/AppContext";


const ConvertToActivityScreen = () => {
    const { id, backlogItem: backlogItemParam } = useLocalSearchParams();
    const { setError } = useAppContext();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const item = JSON.parse(backlogItemParam as string) as IBacklogItem;
    const { mutate: deleteFromBacklog } = useDeleteItemFromBacklogMutation();
    const { mutate: addToSchedule } = useAddActivityToScheduleMutation();
    const { data: userData } = useGetUserQuery();
    const { data: scheduleData } = useGetScheduleForDayQuery(selectedDate);
    const [isStaminaModalVisible, setIsStaminaModalVisible] = useState(false);
    const [isOverlapModalVisible, setIsOverlapModalVisible] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [overlapActivity, setOverlapActivity] = useState<IActivity | null>(null);

    const [activityDetails, setActivityDetails] = useState<ActivityDetails>(() => {
        const isActivity = item.itemType === "activity";
        return {
            title: item.title || "",
            type: isActivity ? item.type || "misc" : "misc",
            startTime: isActivity ? item.startTime || "12:00" : "12:00",
            endTime: isActivity ? item.endTime || "12:15" : "12:15",
            duration: item.duration || 15,
            priority: isActivity ? item.priority || "must_do" : "must_do",
            staminaCost: isActivity ? item.staminaCost ?? 0 : 0,
            subtasks: item.subtasks || [],
        };
    });

    const handleClose = () => {
        router.back();
    };

    const handleAiSuggestion = (suggestion: IActivity) => {
        setActivityDetails(prev => ({
            ...prev,
            type: suggestion.type,
            duration: suggestion.duration,
            priority: suggestion.priority,
            staminaCost: suggestion.staminaCost,
            subtasks: suggestion.subtasks,
            endTime: addMinutesToTime(prev.startTime, suggestion.duration)
        }));
    };

    const handleAddToSchedule = () => {
        if (!activityDetails.title.trim() || !id) return;
        if (!userData || !scheduleData) return;

        const activity: IActivity = {
            ...activityDetails,
            title: activityDetails.title.trim(),
            isCompleted: false,
        };

        const currentStamina = scheduleData.reduce((acc, activity) => acc + activity.staminaCost, 0);
        const totalStaminaUsed = currentStamina + activity.staminaCost;
        if (userData.maxStamina > 0 && totalStaminaUsed / userData.maxStamina > 1.2) {
            setIsStaminaModalVisible(true);
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
            },
            onError: (error) => {
                if (error instanceof ScheduleOverlapError) {
                    setOverlapActivity(error.overlappingActivity);
                    setIsOverlapModalVisible(true);
                } else {
                    setError({
                        message: "Something went wrong when trying to add this activity to your schedule. Please try again.",
                        error
                    });
                }
            }
        });
    };

    return (
        <ScreenWrapper testID="add-to-schedule-screen">
            <View style={tw`flex-row justify-between items-center px-4 py-6`}>
                <TouchableOpacity onPress={handleClose} style={tw`flex-row items-center gap-x-2`}>
                    <Ionicons name="chevron-back" size={24} style={tw`text-gray-600 dark:text-neutral-100`} />
                    <Text style={tw`text-2xl font-semibold text-gray-950 dark:text-white`}>Add Activity</Text>
                </TouchableOpacity>
                <AiSuggestionButton
                    title={activityDetails.title}
                    onSuggestion={handleAiSuggestion}
                    onShowToast={() => setShowToast(true)}
                />
            </View>

            <BacklogItemActivityForm
                activityDetails={activityDetails}
                onActivityDetailsChange={setActivityDetails}
                showDatePicker={true}
                selectedDate={selectedDate}
                onDateChange={setSelectedDate}
                submitButtonLabel="Add to Schedule"
                submitButtonIcon={<Ionicons name="calendar" size={24} style={tw`text-gray-950`} />}
                onSubmit={handleAddToSchedule}
            />

            <NotificationModal
                isVisible={isStaminaModalVisible}
                onClose={() => setIsStaminaModalVisible(false)}
            />

            <NotificationModal
                isVisible={isOverlapModalVisible}
                onClose={() => setIsOverlapModalVisible(false)}
                message={`This activity overlaps with "${overlapActivity?.title}" (${overlapActivity?.startTime}-${overlapActivity?.endTime}). Please choose a different time.`}
            />

            <Toast
                message="AI auto-completion requires a title to work"
                isVisible={showToast}
                onHide={() => setShowToast(false)}
            />
        </ScreenWrapper>
    );
};

export default ConvertToActivityScreen;