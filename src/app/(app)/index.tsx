import { View, TouchableOpacity, StyleSheet } from "react-native";
import { useState } from "react";
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import tw from "twrnc";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import HeaderStaminaBar from "@/features/schedule/HeaderStaminaBar";
import HeaderDateNavigation from "@/features/schedule/HeaderDateNavigation";
import ScheduleTimeline from "@/features/schedule/ScheduleTimeline";
import { useUserStore } from "@/config/userStore";
import { useGetUserQuery } from "@/api/users/getUser";
import { Redirect, useRouter } from "expo-router";
import ErrorModal from "@/components/ui/ErrorModal";
import { IError } from "@/context/AppContext";
import { useGetScheduleForDayQuery } from "@/api/schedules/getScheduleForDay";
import { useCompleteActivityMutation } from "@/api/schedules/completeActivity";
import { useDeleteActivityMutation } from "@/api/schedules/deleteActivity";
import { useAddItemToBacklogMutation } from "@/api/backlog/addItemToBacklog";

const ScheduleScreen = () => {
    const { user } = useUserStore();
    const { data: userData, isPending, isError } = useGetUserQuery(user?.uid);
    const insets = useSafeAreaInsets();
    const [currentDate, setCurrentDate] = useState(new Date());
    const { data: scheduleData, isError: isScheduleError, isPending: isSchedulePending } = useGetScheduleForDayQuery(currentDate, user?.uid || "");
    const router = useRouter();

    const { mutate: completeActivity } = useCompleteActivityMutation();
    const { mutate: deleteActivity } = useDeleteActivityMutation();
    const { mutate: addItemToBacklog } = useAddItemToBacklogMutation();

    if (isPending || isSchedulePending) {
        return null;
    }
    if (isError || isScheduleError) {
        const errorObj: IError = {
            message: "Error retrieving user data. Please try again later."
        };
        return <ErrorModal error={errorObj} handleModalClose={() => {}} />;
    }
    if (userData?.onboardingInfo === null || 
        !userData?.onboardingInfo.startDayTime || 
        !userData?.onboardingInfo.endDayTime ||
        !userData?.onboardingInfo.dayStructure ||
        !userData?.onboardingInfo.priorityActivities) {
        return <Redirect href="/onboarding" />;
    }

    const startDayHour = parseInt(userData.onboardingInfo.startDayTime.split(":")[0]);
    const endDayHour = parseInt(userData.onboardingInfo.endDayTime.split(":")[0]);
    const currentStamina = scheduleData.reduce((acc, activity) => acc + activity.staminaCost, 0);
    const activitiesWithSpecials = scheduleData.length > 0 
        ? [
            {
                id: "day_start",
                title: "Wake Up",
                startTime: userData.onboardingInfo.startDayTime,
                endTime: userData.onboardingInfo.startDayTime,
                duration: 0,
                staminaCost: 0,
                type: "life_maintenance" as const,
                priority: "routine" as const,
                isCompleted: false,
                subtasks: []
            },
            ...scheduleData,
            {
                id: "day_end",
                title: "Wind Down",
                startTime: userData.onboardingInfo.endDayTime,
                endTime: userData.onboardingInfo.endDayTime,
                duration: 0,
                staminaCost: 0,
                type: "life_maintenance" as const,
                priority: "routine" as const,
                isCompleted: false,
                subtasks: []
            }
        ]
        : [];

    const handleActivityComplete = (activity: IActivity) => {
        if (!activity.id || !user?.uid) return;
        completeActivity({
            activityId: activity.id,
            date: currentDate,
            uid: user.uid
        });
    };

    const handleActivityDelete = (activity: IActivity) => {
        if (!activity.id || !user?.uid) return;
        deleteActivity({
            activityId: activity.id,
            date: currentDate,
            uid: user.uid
        });
    };

    const handleActivityEdit = (activity: IActivity) => {
        router.push(`/edit-activity?id=${activity.id}&date=${currentDate.toISOString()}`);
    };

    const handleActivityMoveToBacklog = (activity: IActivity) => {
        if (!user?.uid) return;
        deleteActivity({
            activityId: activity.id!,
            date: currentDate,
            uid: user.uid
        });
        addItemToBacklog({
            item: {
                id: activity.id!,
                itemType: "activity",
                title: activity.title,
                duration: activity.duration,
                type: activity.type,
                priority: activity.priority,
                isCompleted: false,
                startTime: activity.startTime,
                endTime: activity.endTime,
                staminaCost: activity.staminaCost,
                subtasks: activity.subtasks
            },
            uid: user.uid
        });
    };

    return (
        <View style={tw`flex-1 bg-purple-50`}>
            <View style={[tw`bg-purple-50`, { paddingTop: insets.top }]} />            
            <View style={tw`flex-row items-center justify-between px-4`}>
                <HeaderStaminaBar currentStamina={currentStamina} maxStamina={userData.maxStamina} />
                <ScheduleButtonsPanel currentDate={currentDate} />
            </View>
            
            <HeaderDateNavigation 
                currentDate={currentDate} 
                setCurrentDate={setCurrentDate} 
            />
            <View style={[
                tw`flex-1 bg-white rounded-t-3xl`,
                styles.scheduleContainerShadow
            ]}>
                <ScheduleTimeline 
                    activities={activitiesWithSpecials}
                    startDayHour={startDayHour}
                    endDayHour={endDayHour}
                    onActivityComplete={handleActivityComplete}
                    onActivityDelete={handleActivityDelete}
                    onActivityEdit={handleActivityEdit}
                    onActivityMoveToBacklog={handleActivityMoveToBacklog}
                />
            </View>
        </View>
    );
};

const ScheduleButtonsPanel = ({ currentDate }: { currentDate: Date }) => {
    const router = useRouter();

    const handleAiPlannerPress = () => {
        router.push(`/ai-planner?date=${currentDate.toISOString()}`);
    };

    const handleProfilePress = () => {
        router.push("/profile");
    };

    const handleBacklogPress = () => {
        router.push("/backlog");
    };

    return (
        <View style={tw`flex-row ml-4`}>
            <TouchableOpacity style={tw`mr-4`} onPress={handleBacklogPress}>
                <FontAwesome name="inbox" size={24} style={tw`text-gray-950`} />
            </TouchableOpacity>
            <TouchableOpacity style={tw`mr-4`} onPress={handleAiPlannerPress}>
                <Ionicons name="sparkles" size={24} style={tw`text-gray-950`} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleProfilePress}>
                <Ionicons name="settings-sharp" size={24} style={tw`text-gray-950`} />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    scheduleContainerShadow: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4
    }
});

export default ScheduleScreen;