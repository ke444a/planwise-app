import { View, Text, Alert } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import tw from "twrnc";
import { TouchableOpacity } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useState, useEffect } from "react";
import { useGetActivityFromScheduleQuery } from "@/api/schedules/getActivityFromSchedule";
import { useUpdateActivityMutation, ScheduleOverlapError } from "@/api/schedules/updateActivity";
import ScreenWrapper from "@/components/ui/ScreenWrapper";
import { ActivityForm } from "@/components/activity/ActivityForm";
import { NotificationModal } from "@/components/ui/NotificationModal";
import { useAppContext } from "@/context/AppContext"; 

type ActivityDetails = Omit<IActivity, "isCompleted" | "id">;

const EditActivityScreen = () => {
    const { setError } = useAppContext();
    const { id, date, currentStamina, maxStamina } = useLocalSearchParams();
    const currentStaminaNumber = Number(currentStamina);
    const maxStaminaNumber = Number(maxStamina);
    const [selectedDate, setSelectedDate] = useState(new Date(date as string));
    const [activityDetails, setActivityDetails] = useState<ActivityDetails | null>(null);
    const [isStaminaModalVisible, setIsStaminaModalVisible] = useState(false);
    const [isOverlapModalVisible, setIsOverlapModalVisible] = useState(false);
    const [overlapActivity, setOverlapActivity] = useState<IActivity | null>(null);

    const { data: activity, isPending } = useGetActivityFromScheduleQuery(
        id as string,
        selectedDate
    );
    const { mutate: updateActivity } = useUpdateActivityMutation();

    useEffect(() => {
        if (activity) {
            const { id: _id, isCompleted: _isCompleted, ...details } = activity;
            setActivityDetails({
                ...details,
                subtasks: activity.subtasks || []
            });
        }
    }, [activity]);

    const handleClose = () => {
        router.back();
    };

    const handleUpdateActivity = () => {
        if (!activityDetails?.title.trim() || !id || !activity) return;

        const updatedActivity: IActivity = {
            id: id as string,
            ...activityDetails,
            isCompleted: activity.isCompleted || false,
        };

        if (updatedActivity.startTime > updatedActivity.endTime) {
            Alert.alert("Unable to update activity", "Activity cannot span multiple days");
            return;
        }

        const totalStaminaUsed = currentStaminaNumber + updatedActivity.staminaCost;
        if (
            maxStaminaNumber > 0 && 
            totalStaminaUsed / maxStaminaNumber > 1.2 && 
            !updatedActivity.isCompleted && 
            updatedActivity.staminaCost > (activity.staminaCost || 0)
        ) {
            setIsStaminaModalVisible(true);
            return;
        }

        updateActivity({ 
            activity: updatedActivity,
            date: selectedDate,
            originalActivity: activity
        }, {
            onSuccess: () => {
                router.back();
            },
            onError: (error) => {
                if (error instanceof ScheduleOverlapError) {
                    setOverlapActivity(error.overlappingActivity);
                    setIsOverlapModalVisible(true);
                } else {
                    setError({
                        message: "Something went wrong when trying to update activity. Please try again.",
                        error
                    });
                }
            }
        });
    };

    if (isPending || !activityDetails) {
        return null;
    }

    return (
        <ScreenWrapper>
            <View style={tw`flex-row justify-between items-center px-4 py-6`}>
                <TouchableOpacity onPress={handleClose} style={tw`flex-row items-center gap-x-2`}>
                    <Ionicons name="chevron-back" size={24} style={tw`text-gray-600 dark:text-neutral-100`} />
                    <Text style={tw`text-2xl font-semibold text-gray-950 dark:text-white`}>Edit Activity</Text>
                </TouchableOpacity>
            </View>

            <ActivityForm
                activityDetails={activityDetails}
                onActivityDetailsChange={setActivityDetails}
                submitButtonLabel="Update"
                submitButtonIcon={<Ionicons name="checkmark" size={24} style={tw`text-gray-950`} />}
                onSubmit={handleUpdateActivity}
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
        </ScreenWrapper>
    );
};

export default EditActivityScreen;