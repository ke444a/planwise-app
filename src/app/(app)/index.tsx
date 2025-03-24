import { View, TouchableOpacity, StyleSheet } from "react-native";
import { useState } from "react";
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import tw from "twrnc";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import HeaderStaminaBar from "@/components/schedule/HeaderStaminaBar";
import HeaderDateNavigation from "@/components/schedule/HeaderDateNavigation";
import ScheduleTimeline from "@/components/schedule/ScheduleTimeline";
import { useGetUserQuery } from "@/api/users/getUser";
import { Redirect, router } from "expo-router";
import ErrorModal from "@/components/ui/ErrorModal";
import { IError } from "@/context/AppContext";
import { useGetScheduleForDayQuery } from "@/api/schedules/getScheduleForDay";
import { useCompleteActivityMutation } from "@/api/schedules/completeActivity";
import { useDeleteActivityMutation } from "@/api/schedules/deleteActivity";
import { useAddItemToBacklogMutation } from "@/api/backlogs/addItemToBacklog";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import AntDesign from "@expo/vector-icons/AntDesign";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

const ScheduleScreen = () => {
    const { data: userData, isError, isPending: isUserLoading } = useGetUserQuery();
    const insets = useSafeAreaInsets();
    const [currentDate, setCurrentDate] = useState(new Date());

    const { data: currentScheduleData, isError: isScheduleError } = useGetScheduleForDayQuery(currentDate);
    
    const { mutate: completeActivity } = useCompleteActivityMutation();
    const { mutate: deleteActivity } = useDeleteActivityMutation();
    const { mutate: addItemToBacklog } = useAddItemToBacklogMutation();
    if (isError || isScheduleError) {
        const errorObj: IError = {
            message: "Error retrieving user data. Please try again later."
        };
        return <ErrorModal error={errorObj} handleModalClose={() => {}} />;
    }
    if (isUserLoading) {
        return null;
    }

    if (userData && userData?.onboardingInfo === null || 
        !userData?.onboardingInfo?.startDayTime || 
        !userData?.onboardingInfo?.endDayTime ||
        !userData?.onboardingInfo?.dayStructure ||
        !userData?.onboardingInfo?.priorityActivities) {
        return <Redirect href="/onboarding" />;
    }

    const startDayHour = parseInt(userData.onboardingInfo.startDayTime.split(":")[0]);
    const endDayHour = parseInt(userData.onboardingInfo.endDayTime.split(":")[0]);
    const currentStamina = currentScheduleData?.reduce((acc, activity) => acc + activity.staminaCost, 0) ?? 0;

    const handleActivityComplete = (activity: IActivity) => {
        if (!activity.id) return;
        completeActivity({
            activityId: activity.id,
            date: currentDate,
            isCompleted: !activity.isCompleted
        });
    };

    const handleActivityDelete = (activity: IActivity) => {
        if (!activity.id) return;
        deleteActivity({
            activityId: activity.id,
            date: currentDate
        });
    };

    const handleActivityEdit = (activity: IActivity) => {
        router.push({
            pathname: "/activity/edit",
            params: {
                id: activity.id,
                date: currentDate.toISOString(),
                currentStamina: currentStamina,
                maxStamina: userData.maxStamina
            }
        });
    };

    const handleActivityMoveToBacklog = (activity: IActivity) => {
        deleteActivity({
            activityId: activity.id!,
            date: currentDate
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
            }
        });
    };

    return (
        <View style={tw`flex-1 bg-purple-50 dark:bg-pink-200`}>
            <View style={[tw`bg-purple-50 dark:bg-pink-200`, { paddingTop: insets.top }]} />            
            <View style={tw`flex-row items-center justify-between px-4`}>
                <HeaderStaminaBar currentStamina={currentStamina} maxStamina={userData.maxStamina} />
                <ScheduleButtonsPanel 
                    currentStamina={currentStamina} 
                    maxStamina={userData.maxStamina} 
                    currentDate={currentDate}
                />
            </View>
            
            <HeaderDateNavigation 
                currentDate={currentDate} 
                setCurrentDate={setCurrentDate} 
            />
            <Animated.View 
                style={[tw`flex-1 bg-white rounded-t-3xl dark:bg-zinc-900`, styles.scheduleContainerShadow]}
                entering={FadeIn.duration(200)}
                exiting={FadeOut.duration(200)}
                key={currentDate.toISOString()}
            >
                <ScheduleTimeline 
                    activities={currentScheduleData ?? []}
                    scheduleDate={currentDate}
                    startDayHour={startDayHour}
                    endDayHour={endDayHour}
                    onActivityComplete={handleActivityComplete}
                    onActivityDelete={handleActivityDelete}
                    onActivityEdit={handleActivityEdit}
                    onActivityMoveToBacklog={handleActivityMoveToBacklog}
                />
            </Animated.View>
            <TouchableOpacity
                style={[
                    tw`absolute bottom-14 right-6 w-16 h-16 bg-purple-400 rounded-full items-center justify-center`,
                    styles.floatingButton
                ]}
                onPress={() => {
                    router.push({
                        pathname: "/ai-planner",
                        params: {
                            date: currentDate.toISOString(),
                            currentStamina: currentStamina,
                            maxStamina: userData.maxStamina
                        }
                    });
                }}
            >
                <MaterialCommunityIcons name="robot" size={35} style={tw`text-white`} />
            </TouchableOpacity>
        </View>
    );
};

interface ScheduleButtonsPanelProps {
    currentStamina: number;
    maxStamina: number;
    currentDate: Date;
}

const ScheduleButtonsPanel = ({ currentStamina, maxStamina, currentDate }: ScheduleButtonsPanelProps) => {
    const handleCreateActivityPress = () => {
        router.push({
            pathname: "/activity/add",
            params: {
                currentStamina: currentStamina,
                maxStamina: maxStamina,
                date: currentDate.toISOString()
            }
        });
    };

    const handleProfilePress = () => {
        router.push("/profile");
    };

    const handleBacklogPress = () => {
        router.push("/backlog");
    };

    return (
        <View style={tw`flex-row ml-4`}>
            <TouchableOpacity style={tw`mr-4`} onPress={handleCreateActivityPress}>
                <AntDesign name="pluscircle" size={24} style={tw`text-gray-950`} />
            </TouchableOpacity>
            <TouchableOpacity style={tw`mr-4`} onPress={handleBacklogPress}>
                <FontAwesome name="inbox" size={24} style={tw`text-gray-950`} />
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
    },
    floatingButton: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    }
});

export default ScheduleScreen;