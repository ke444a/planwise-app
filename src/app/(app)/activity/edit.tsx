import { View, Text } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import tw from "twrnc";
import { TouchableOpacity } from "react-native";
import AntDesign from "@expo/vector-icons/AntDesign";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useState } from "react";
import { useGetActivityFromScheduleQuery } from "@/api/schedules/getActivityFromSchedule";
import { useUpdateActivityMutation } from "@/api/schedules/updateActivity";
import ScreenWrapper from "@/components/ui/ScreenWrapper";
import { ActivityForm } from "@/components/activity/ActivityForm";
import { NotificationModal } from "@/components/ui/NotificationModal";

type ActivityDetails = Omit<IActivity, "isCompleted" | "id">;

const EditActivityScreen = () => {
    const { id, date, currentStamina, maxStamina } = useLocalSearchParams();
    const currentStaminaNumber = Number(currentStamina);
    const maxStaminaNumber = Number(maxStamina);
    const [selectedDate, setSelectedDate] = useState(new Date(date as string));
    const [activityDetails, setActivityDetails] = useState<ActivityDetails | null>(null);
    const [isModalVisible, setIsModalVisible] = useState(false);

    const { data: activity, isLoading } = useGetActivityFromScheduleQuery(
        id as string,
        selectedDate
    );
    const { mutate: updateActivity } = useUpdateActivityMutation();

    const handleClose = () => {
        router.back();
    };

    const handleUpdateActivity = () => {
        if (!activityDetails?.title.trim() || !id) return;

        const updatedActivity: IActivity = {
            id: id as string,
            ...activityDetails,
            isCompleted: activity?.isCompleted || false,
        };

        const totalStaminaUsed = currentStaminaNumber + updatedActivity.staminaCost;
        if (
            maxStaminaNumber > 0 && 
            totalStaminaUsed / maxStaminaNumber > 1.2 && 
            !updatedActivity.isCompleted && 
            updatedActivity.staminaCost > (activity?.staminaCost || 0)
        ) {
            setIsModalVisible(true);
            return;
        }

        updateActivity({ 
            activity: updatedActivity, 
            date: selectedDate, 
        });
        router.back();
    };

    if (isLoading || !activity) {
        return null;
    }

    return (
        <ScreenWrapper>
            <View style={tw`flex-row justify-between items-center px-4 py-6`}>
                <Text style={tw`text-2xl font-semibold`}>Edit Activity</Text>
                <TouchableOpacity onPress={handleClose}>
                    <AntDesign name="closecircle" size={24} style={tw`text-gray-500`} />
                </TouchableOpacity>
            </View>

            <ActivityForm
                initialData={activity}
                onActivityDetailsChange={setActivityDetails}
                submitButtonLabel="Update"
                submitButtonIcon={<Ionicons name="checkmark" size={24} style={tw`text-gray-950`} />}
                onSubmit={handleUpdateActivity}
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

export default EditActivityScreen;