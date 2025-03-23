import { View, Text } from "react-native";
import { router } from "expo-router";
import tw from "twrnc";
import { TouchableOpacity } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useState } from "react";
import { useAddActivityToScheduleMutation } from "@/api/schedules/addActivityToSchedule";
import { useUserStore } from "@/libs/userStore";
import ScreenWrapper from "@/components/ui/ScreenWrapper";
import { ActivityForm } from "@/components/activity/ActivityForm";

type ActivityDetails = Omit<IActivity, "isCompleted" | "id">;

const AddActivityScreen = () => {
    const { user } = useUserStore();
    const { mutate: addActivity } = useAddActivityToScheduleMutation();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [activityDetails, setActivityDetails] = useState<ActivityDetails | null>(null);

    const handleClose = () => {
        router.back();
    };

    const handleCreateActivity = () => {
        if (!activityDetails?.title.trim() || !user?.uid) return;

        const activity: IActivity = {
            ...activityDetails,
            isCompleted: false,
        };
        
        addActivity({ 
            activity, 
            date: selectedDate, 
            uid: user.uid 
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
        </ScreenWrapper>
    );
};

export default AddActivityScreen;
