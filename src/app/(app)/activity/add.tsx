import { View, Text } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import tw from "twrnc";
import { TouchableOpacity } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useState } from "react";
import { useAddActivityToScheduleMutation, ScheduleOverlapError } from "@/api/schedules/addActivityToSchedule";
import { useGetScheduleForDayQuery } from "@/api/schedules/getScheduleForDay";
import ScreenWrapper from "@/components/ui/ScreenWrapper";
import { ActivityForm } from "@/components/activity/ActivityForm";
import { NotificationModal } from "@/components/ui/NotificationModal";
import { AiSuggestionButton } from "@/components/activity/AiSuggestionButton";
import { addMinutesToTime } from "@/utils/addMinutesToTime";
import { Toast } from "@/components/ui/Toast";
import { useAppContext } from "@/context/AppContext";
import { checkTimeOverlap } from "@/utils/timeOverlap";

type ActivityDetails = Omit<IActivity, "isCompleted" | "id">;

const AddActivityScreen = () => {
    const { setError } = useAppContext();
    const { mutate: addActivity } = useAddActivityToScheduleMutation();
    const { currentStamina, maxStamina, date } = useLocalSearchParams();
    const [selectedDate, setSelectedDate] = useState(new Date(date as string));
    const [activityDetails, setActivityDetails] = useState<ActivityDetails>({
        title: "",
        type: "misc",
        startTime: "12:00",
        endTime: "12:15",
        duration: 15,
        priority: "must_do",
        staminaCost: 0,
        subtasks: [],
    });
    const [isStaminaModalVisible, setIsStaminaModalVisible] = useState(false);
    const [isOverlapModalVisible, setIsOverlapModalVisible] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [overlapActivity, setOverlapActivity] = useState<IActivity | null>(null);

    const currentStaminaNumber = Number(currentStamina);
    const maxStaminaNumber = Number(maxStamina);

    const { data: existingActivities = [] } = useGetScheduleForDayQuery(selectedDate);

    const handleClose = () => {
        router.back();
    };

    const handleCreateActivity = () => {
        if (!activityDetails.title.trim()) return;
        const activity: IActivity = {
            ...activityDetails,
            isCompleted: false,
        };
        
        // Check for time overlap
        const overlappingActivity = checkTimeOverlap(
            activity.startTime,
            activity.endTime,
            existingActivities
        );

        if (overlappingActivity) {
            setOverlapActivity(overlappingActivity);
            setIsOverlapModalVisible(true);
            return;
        }

        // Check stamina
        const totalStaminaUsed = currentStaminaNumber + activity.staminaCost;
        if (maxStaminaNumber > 0 && totalStaminaUsed / maxStaminaNumber > 1.2) {
            setIsStaminaModalVisible(true);
            return;
        }
        
        addActivity(
            { 
                activity, 
                date: selectedDate, 
            },
            {
                onSuccess: () => {
                    router.back();
                },
                onError: (error) => {
                    if (error instanceof ScheduleOverlapError) {
                        setOverlapActivity(error.overlappingActivity);
                        setIsOverlapModalVisible(true);
                    } else {
                        setError({
                            message: "Something went wrong when trying to add activity. Please try again.",
                            error
                        });
                    }
                }
            }
        );
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

    return (
        <ScreenWrapper testID="add-activity-screen">
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

            <ActivityForm
                activityDetails={activityDetails}
                onActivityDetailsChange={setActivityDetails}
                submitButtonLabel="Create"
                submitButtonIcon={<Ionicons name="checkmark" size={24} style={tw`text-gray-950`} />}
                onSubmit={handleCreateActivity}
                selectedDate={selectedDate}
                onDateChange={setSelectedDate}
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

export default AddActivityScreen;
