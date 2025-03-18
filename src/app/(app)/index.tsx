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

// Sample activities data with more test cases
const sampleActivities: IActivity[] = [
    // Basic activities from before
    {
        id: "1",
        title: "Breakfast",
        startTime: "8:00",
        endTime: "8:30",
        duration: 30,
        staminaCost: 10,
        priority: "routine",
        type: "food",
        isCompleted: true,
        subtasks: []
    },
    {
        id: "2",
        title: "Prepare for Exam",
        startTime: "9:00",
        endTime: "11:00",
        duration: 120,
        staminaCost: 20,
        priority: "must_do",
        type: "focus_work",
        isCompleted: false,
        subtasks: [
            { title: "Read chapter 1", isCompleted: true },
            { title: "Review notes", isCompleted: false },
            { title: "Solve practice problems", isCompleted: false }
        ]
    },
    
    // Test case 1: Two consecutive activities with no gap in time
    {
        id: "3",
        title: "Gym",
        startTime: "12:00",
        endTime: "13:00",
        duration: 60,
        staminaCost: 3,
        priority: "nice_to_have",
        type: "health_fitness",
        isCompleted: false,
        subtasks: []
    },
    {
        id: "4",
        title: "Math 1B",
        startTime: "13:00",
        endTime: "15:00",
        duration: 120,
        staminaCost: 10,
        priority: "get_it_done",
        type: "education",
        isCompleted: false,
        subtasks: []
    },
    
    // Test case 2: Multiple activities within the same hour
    {
        id: "5",
        title: "Quick Call",
        startTime: "15:00",
        endTime: "15:15",
        duration: 15,
        staminaCost: 2,
        priority: "routine",
        type: "collaborative_work",
        isCompleted: false,
        subtasks: []
    },
    {
        id: "6",
        title: "Email Replies",
        startTime: "15:20",
        endTime: "15:40",
        duration: 20,
        staminaCost: 5,
        priority: "must_do",
        type: "repetitive_tasks",
        isCompleted: false,
        subtasks: []
    },
    {
        id: "7",
        title: "Coffee Break",
        startTime: "15:45",
        endTime: "16:00",
        duration: 15,
        staminaCost: 0,
        priority: "routine",
        type: "food",
        isCompleted: false,
        subtasks: []
    },
    
    // Test case 3: Activities with gaps between them
    {
        id: "8",
        title: "Team Meeting",
        startTime: "16:30",
        endTime: "17:30",
        duration: 60,
        staminaCost: 8,
        priority: "get_it_done",
        type: "collaborative_work",
        isCompleted: false,
        subtasks: []
    },
    {
        id: "9",
        title: "Dinner",
        startTime: "18:00",
        endTime: "19:00",
        duration: 60,
        staminaCost: 0,
        priority: "routine",
        type: "food",
        isCompleted: false,
        subtasks: []
    },
    
    // Test case 4: Short activity followed by long activity
    {
        id: "10",
        title: "Evening News",
        startTime: "19:15",
        endTime: "19:30",
        duration: 15,
        staminaCost: 0,
        priority: "routine",
        type: "recreation",
        isCompleted: false,
        subtasks: []
    },
    {
        id: "11",
        title: "Study Session",
        startTime: "20:00",
        endTime: "22:00",
        duration: 120,
        staminaCost: 15,
        priority: "get_it_done",
        type: "education",
        isCompleted: false,
        subtasks: []
    }
];

const ScheduleScreen = () => {
    const { user } = useUserStore();
    const { data: userData, isPending, error } = useGetUserQuery(user?.uid);
    const insets = useSafeAreaInsets();
    const [currentDate, setCurrentDate] = useState(new Date());

    if (isPending) {
        return null;
    }
    if (error) {
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

    const startDayHour = parseInt(userData?.onboardingInfo.startDayTime.split(":")[0]);
    const endDayHour = parseInt(userData?.onboardingInfo.endDayTime.split(":")[0]);

    return (
        <View style={tw`flex-1 bg-purple-50`}>
            <View style={[tw`bg-purple-50`, { paddingTop: insets.top }]} />            
            <View style={tw`flex-row items-center justify-between px-4`}>
                <HeaderStaminaBar currentStamina={20} maxStamina={25} />
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
                    activities={sampleActivities}
                    startDayHour={startDayHour}
                    endDayHour={endDayHour}
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

    return (
        <View style={tw`flex-row ml-4`}>
            <TouchableOpacity style={tw`mr-4`}>
                <FontAwesome name="inbox" size={24} style={tw`text-gray-950`} />
            </TouchableOpacity>
            <TouchableOpacity style={tw`mr-4`} onPress={handleAiPlannerPress}>
                <Ionicons name="sparkles" size={24} style={tw`text-gray-950`} />
            </TouchableOpacity>
            <TouchableOpacity>
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