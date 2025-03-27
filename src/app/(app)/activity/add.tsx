import { View, Text } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import tw from "twrnc";
import { TouchableOpacity } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useState } from "react";
import { useAddActivityToScheduleMutation } from "@/api/schedules/addActivityToSchedule";
import ScreenWrapper from "@/components/ui/ScreenWrapper";
import { ActivityForm } from "@/components/activity/ActivityForm";
import { NotificationModal } from "@/components/ui/NotificationModal";
import { AiSuggestionButton } from "@/components/activity/AiSuggestionButton";
import { addMinutesToTime } from "@/utils/addMinutesToTime";
import { Toast } from "@/components/ui/Toast";

type ActivityDetails = Omit<IActivity, "isCompleted" | "id">;

const AddActivityScreen = () => {
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
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [showToast, setShowToast] = useState(false);

    const currentStaminaNumber = Number(currentStamina);
    const maxStaminaNumber = Number(maxStamina);

    const handleClose = () => {
        router.back();
    };

    const handleCreateActivity = () => {
        if (!activityDetails.title.trim()) return;
        const activity: IActivity = {
            ...activityDetails,
            isCompleted: false,
        };
        
        const totalStaminaUsed = currentStaminaNumber + activity.staminaCost;
        if (maxStaminaNumber > 0 && totalStaminaUsed / maxStaminaNumber > 1.2) {
            setIsModalVisible(true);
            return;
        }
        
        addActivity({ 
            activity, 
            date: selectedDate, 
        });
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

    return (
        <ScreenWrapper>
            <View style={tw`flex-row justify-between items-center px-4 py-6`}>
                <View style={tw`flex-row items-center gap-x-2`}>
                    <TouchableOpacity onPress={handleClose}>
                        <Ionicons name="chevron-back" size={24} style={tw`text-gray-600`} />
                    </TouchableOpacity>
                    <Text style={tw`text-2xl font-semibold text-gray-600`}>Add Activity</Text>
                </View>
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

export default AddActivityScreen;
