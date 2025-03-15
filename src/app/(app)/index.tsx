import { View, TouchableOpacity, StyleSheet } from "react-native";
import { useState } from "react";
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import tw from "twrnc";
import StaminaBar from "@/components/schedule/StaminaBar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import DateNavigation from "@/components/schedule/DateNavigation";
import ScheduleTimeline from "@/components/schedule/ScheduleTimeline";

// Sample activities data
const sampleActivities = [
    {
        id: "1",
        title: "Breakfast",
        startTime: "8:00",
        endTime: "8:30",
        duration: "30 min",
        icon: "utensils",
        iconType: "fontawesome",
        iconColor: "#3B82F6",
        effortPoints: 0,
        status: "completed"
    },
    {
        id: "2",
        title: "Prepare for Exam",
        startTime: "9:00",
        endTime: "11:00",
        duration: "2 hr",
        icon: "bullseye",
        iconType: "fontawesome",
        iconColor: "#EF4444",
        effortPoints: 10,
        priority: "must",
        progress: "2/3"
    },
    {
        id: "3",
        title: "Gym",
        startTime: "12:00",
        endTime: "13:00",
        duration: "1 hr",
        icon: "body",
        iconType: "ionicons",
        iconColor: "#3B82F6",
        effortPoints: 3,
        priority: "nice"
    },
    {
        id: "4",
        title: "Math 1B",
        startTime: "13:00",
        endTime: "15:00",
        duration: "2 hr",
        icon: "school",
        iconType: "ionicons",
        iconColor: "#F59E0B",
        effortPoints: 10
    }
];

const ScheduleScreen = () => {
    const insets = useSafeAreaInsets();
    const [currentDate, setCurrentDate] = useState(new Date());

    return (
        <View style={tw`flex-1 bg-purple-50`}>
            <View style={[tw`bg-purple-50`, { paddingTop: insets.top }]} />            
            <View style={tw`flex-row items-center justify-between px-6`}>
                <StaminaBar currentStamina={20} maxStamina={25} />
                <ScheduleButtonsPanel />
            </View>
            
            <DateNavigation 
                currentDate={currentDate} 
                setCurrentDate={setCurrentDate} 
            />

            <View style={[
                tw`flex-1 bg-white rounded-t-3xl`,
                styles.scheduleContainerShadow
            ]}>
                <ScheduleTimeline 
                    activities={sampleActivities}
                    date={currentDate}
                />
            </View>
        </View>
    );
};

const ScheduleButtonsPanel = () => {
    return (
        <View style={tw`flex-row ml-4`}>
            <TouchableOpacity style={tw`mr-4`}>
                <FontAwesome name="inbox" size={24} color="#333" />
            </TouchableOpacity>
            <TouchableOpacity style={tw`mr-4`}>
                <Ionicons name="sparkles" size={24} color="#333" />
            </TouchableOpacity>
            <TouchableOpacity>
                <Ionicons name="settings-sharp" size={24} color="#333" />
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