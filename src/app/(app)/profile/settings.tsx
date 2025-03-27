import { View, Text, TouchableOpacity } from "react-native";
import tw from "twrnc";
import { router, Redirect } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useGetUserQuery } from "@/api/users/getUser";
import { useUpdateUserPreferencesMutation } from "@/api/users/updateUserPreferences";
import { useAppContext } from "@/context/AppContext";
import { ReactNode, useState } from "react";
import { ACTIVITY_TYPE_TO_STR, DAY_STRUCTURE_TO_STR } from "@/libs/constants";
import TimePickerBottomSheet from "@/components/profile/TimePickerBottomSheet";
import StaminaPickerBottomSheet from "@/components/profile/StaminaPickerBottomSheet";
import DayStructurePickerBottomSheet from "@/components/profile/DayTypePickerBottomSheet";
import PriorityPickerBottomSheet from "@/components/profile/PriorityPickerBottomSheet";
import ScreenWrapper from "@/components/ui/ScreenWrapper";

interface IPreferenceRow {
    icon: ReactNode;
    label: string;
    value: string;
    onPress?: () => void;
}

const PreferenceRow = ({ icon, label, value, onPress }: IPreferenceRow) => (
    <TouchableOpacity
        style={tw`flex-row items-center p-3 bg-white border border-gray-200 rounded-xl mb-3`}
        onPress={onPress}
    >
        <View style={tw`mr-1`}>{icon}</View>
        <Text style={tw`text-gray-950 text-lg font-medium flex-1`}>{label}</Text>
        <View style={tw`flex-row items-center`}>
            <Text style={tw`text-gray-500 text-lg mr-2`}>{value}</Text>
            <Ionicons name="chevron-forward" size={20} style={tw`text-gray-500`} />
        </View>
    </TouchableOpacity>
);

const PreferencesScreen = () => {
    const { setError } = useAppContext();
    const { data: userData, isPending, isError } = useGetUserQuery();
    const { mutate: updatePreferences } = useUpdateUserPreferencesMutation();
    const [timePickerVisible, setTimePickerVisible] = useState(false);
    const [selectedTimeType, setSelectedTimeType] = useState<"start" | "end" | null>(null);
    const [staminaPickerVisible, setStaminaPickerVisible] = useState(false);
    const [dayStructurePickerVisible, setDayStructurePickerVisible] = useState(false);
    const [priorityPickerVisible, setPriorityPickerVisible] = useState(false);

    const formatTime = (time: string) => {
        return new Date(`2000-01-01T${time}`).toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "numeric",
            hour12: false
        });
    };

    const handleTimePress = (type: "start" | "end") => {
        setSelectedTimeType(type);
        setTimePickerVisible(true);
    };

    const handleTimeSelected = (selectedTime: string) => {        
        const updateField = selectedTimeType === "start" ? "onboardingInfo.startDayTime" : "onboardingInfo.endDayTime";
        updatePreferences({
            updates: {
                [updateField]: selectedTime
            }
        }, {
            onError: (error) => {
                setError({
                    code: "firebase-error",
                    message: "Failed to update time preference. Please try again.",
                    debug: `PreferencesScreen: handleTimeSelected - ${error}`
                });
            }
        });

        setTimePickerVisible(false);
        setSelectedTimeType(null);
    };

    const handleStaminaSelected = (value: number) => {

        updatePreferences({
            updates: {
                maxStamina: value
            }
        }, {
            onError: (error) => {
                setError({
                    code: "firebase-error",
                    message: "Failed to update stamina preference. Please try again.",
                    debug: `PreferencesScreen: handleStaminaSelected - ${error}`
                });
            }
        });
    };

    const handleDayStructureSelected = (value: "morning" | "mixed" | "night") => {
        updatePreferences({
            updates: {
                "onboardingInfo.dayStructure": value
            }
        }, {
            onError: (error) => {
                setError({
                    code: "firebase-error",
                    message: "Failed to update day structure preference. Please try again.",
                    debug: `PreferencesScreen: handleDayStructureSelected - ${error}`
                });
            }
        });
    };

    const handlePriorityActivitiesSelected = (values: ActivityType[]) => {
        updatePreferences({
            updates: {
                "onboardingInfo.priorityActivities": values
            }
        }, {
            onError: (error) => {
                setError({
                    code: "firebase-error",
                    message: "Failed to update priority activities. Please try again.",
                    debug: `PreferencesScreen: handlePriorityActivitiesSelected - ${error}`
                });
            }
        });
    };

    if (isPending) {
        return null;
    }

    if (isError) {
        setError({
            code: "firebase-error",
            message: "Something went wrong while loading your data. Please try again later.",
            debug: "PreferencesScreen: isError"
        });
        return <Redirect href="/profile" />;
    }

    if (!userData?.onboardingInfo) {
        setError({
            code: "firebase-error",
            message: "Something went wrong while loading your data. Please try again later.",
            debug: "PreferencesScreen: !userData?.onboardingInfo"
        });
        return <Redirect href="/profile" />;
    }

    const dayStructure = DAY_STRUCTURE_TO_STR[userData.onboardingInfo.dayStructure];
    const priorityActivities = userData.onboardingInfo.priorityActivities.map((activity) => ACTIVITY_TYPE_TO_STR[activity]);
    
    const preferences: IPreferenceRow[] = [
        {
            icon: <Ionicons name="sunny" size={22} style={tw`text-gray-600`} />,
            label: "Start time",
            value: formatTime(userData.onboardingInfo.startDayTime),
            onPress: () => handleTimePress("start")
        },
        {
            icon: <Ionicons name="moon" size={22} style={tw`text-gray-600`} />,
            label: "End time",
            value: formatTime(userData.onboardingInfo.endDayTime),
            onPress: () => handleTimePress("end")
        },
        {
            icon: <MaterialCommunityIcons name="lightning-bolt" size={22} style={tw`text-gray-600`} />,
            label: "Stamina",
            value: userData.maxStamina.toString(),
            onPress: () => setStaminaPickerVisible(true)
        },
        {
            icon: <MaterialIcons name="task" size={22} style={tw`text-gray-600`} />,
            label: "Priorities",
            value: priorityActivities.length > 1 ? 
                priorityActivities.slice(0, 1).join(", ") + "..." :
                (priorityActivities.length > 0 ? priorityActivities.join(", ") : "..."),
            onPress: () => setPriorityPickerVisible(true)
        },
        {
            icon: <MaterialCommunityIcons name="account-clock" size={22} style={tw`text-gray-600`} />,
            label: "Day structure",
            value: dayStructure,
            onPress: () => setDayStructurePickerVisible(true)
        }
    ];

    return (
        <ScreenWrapper>
            <View style={tw`px-4 py-6`}>
                <TouchableOpacity onPress={() => router.back()} style={tw`flex-row items-center gap-x-2 mb-8`}>
                    <Ionicons name="chevron-back" size={24} style={tw`text-gray-600 dark:text-neutral-100`} />
                    <Text style={tw`text-2xl font-semibold text-gray-950 dark:text-white`}>Preferences</Text>
                </TouchableOpacity>

                {preferences.map((pref, index) => (
                    <PreferenceRow key={index} {...pref} />
                ))}
            </View>

            <TimePickerBottomSheet
                visible={timePickerVisible}
                onClose={() => {
                    setTimePickerVisible(false);
                    setSelectedTimeType(null);
                }}
                initialTime={selectedTimeType === "start" ? 
                    userData.onboardingInfo.startDayTime : 
                    userData.onboardingInfo.endDayTime
                }
                mode={selectedTimeType === "start" ? "morning" : "evening"}
                onTimeSelected={handleTimeSelected}
            />

            <StaminaPickerBottomSheet
                visible={staminaPickerVisible}
                onClose={() => setStaminaPickerVisible(false)}
                initialValue={userData.maxStamina}
                onValueSelected={handleStaminaSelected}
                minValue={10}
                maxValue={50}
            />

            <DayStructurePickerBottomSheet
                visible={dayStructurePickerVisible}
                onClose={() => setDayStructurePickerVisible(false)}
                initialValue={userData.onboardingInfo.dayStructure}
                onValueSelected={handleDayStructureSelected}
            />

            <PriorityPickerBottomSheet
                visible={priorityPickerVisible}
                onClose={() => setPriorityPickerVisible(false)}
                initialValues={userData.onboardingInfo.priorityActivities}
                onValuesSelected={handlePriorityActivitiesSelected}
            />
        </ScreenWrapper>
    );
};

export default PreferencesScreen;
