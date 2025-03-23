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

type ActivityDetails = Omit<IActivity, "isCompleted" | "id">;

const AddActivityScreen = () => {
    const { mutate: addActivity } = useAddActivityToScheduleMutation();
    const { currentStamina, maxStamina, date } = useLocalSearchParams();
    const [selectedDate, setSelectedDate] = useState(new Date(date as string));
    const [activityDetails, setActivityDetails] = useState<ActivityDetails | null>(null);
    const [isModalVisible, setIsModalVisible] = useState(false);

    const currentStaminaNumber = Number(currentStamina);
    const maxStaminaNumber = Number(maxStamina);

    const handleClose = () => {
        router.back();
    };

    const handleCreateActivity = () => {
        if (!activityDetails?.title.trim()) return;
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

    return (
        <ScreenWrapper>
            <View style={tw`flex-row justify-between items-center px-4 py-6`}>
                <TouchableOpacity onPress={handleClose} style={tw`flex-row items-center gap-x-2`}>
                    <Ionicons name="chevron-back" size={24} style={tw`text-gray-600`} />
                    <Text style={tw`text-2xl font-semibold text-gray-600`}>Add Activity</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => {}}>
                    <Ionicons name="sparkles" size={24} style={tw`text-purple-400`} />
                </TouchableOpacity>
            </View>

            <ActivityForm
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
        </ScreenWrapper>
    );
};

export default AddActivityScreen;
