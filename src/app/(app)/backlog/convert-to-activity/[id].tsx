import { View, Text } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import tw from "twrnc";
import { TouchableOpacity } from "react-native";
import AntDesign from "@expo/vector-icons/AntDesign";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useState } from "react";
import { useUserStore } from "@/libs/userStore";
import { useGetBacklogItemQuery } from "@/api/backlogs/getBacklogItem";
import { useDeleteItemFromBacklogMutation } from "@/api/backlogs/deleteItemFromBacklog";
import { useAddActivityToScheduleMutation } from "@/api/schedules/addActivityToSchedule";
import ScreenWrapper from "@/components/ui/ScreenWrapper";
import { BacklogItemActivityForm } from "@/components/backlog";

type ActivityDetails = Omit<IActivity, "isCompleted" | "id">;

const ConvertToActivityScreen = () => {
    const { id } = useLocalSearchParams();
    const { user } = useUserStore();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const { data: item, isPending } = useGetBacklogItemQuery(id as string, user?.uid || "");
    const { mutate: deleteFromBacklog } = useDeleteItemFromBacklogMutation();
    const { mutate: addToSchedule } = useAddActivityToScheduleMutation();
    const [activityDetails, setActivityDetails] = useState<ActivityDetails | null>(null);

    const handleClose = () => {
        router.back();
    };

    const handleAddToSchedule = () => {
        if (!activityDetails?.title.trim() || !user?.uid || !id || !item) return;

        const activity: IActivity = {
            ...activityDetails,
            title: activityDetails.title.trim(),
            isCompleted: false,
        };

        addToSchedule({ 
            activity, 
            date: selectedDate, 
            uid: user.uid 
        }, {
            onSuccess: () => {
                deleteFromBacklog({ 
                    id: id as string, 
                    uid: user.uid 
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
                <Text style={tw`text-2xl font-semibold`}>Add to Schedule</Text>
                <TouchableOpacity onPress={handleClose}>
                    <AntDesign name="closecircle" size={24} style={tw`text-gray-500`} />
                </TouchableOpacity>
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
        </ScreenWrapper>
    );
};

export default ConvertToActivityScreen;