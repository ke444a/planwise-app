import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import tw from "twrnc";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, Redirect } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useUserStore } from "@/config/userStore";
import { useGetUserQuery } from "@/api/users/getUser";
import { useUpdateUserPreferencesMutation } from "@/api/users/updateUserPreferences";
import { useAppContext } from "@/context/AppContext";
import { ReactNode, useState } from "react";
import { convertActivityTypeToStr } from "@/utils/convertActivityTypeToStr";
import { convertDayStructureToStr } from "@/utils/convertDayStructureToStr";
import TimePickerBottomSheet from "@/components/TimePickerBottomSheet";
import StaminaPickerBottomSheet from "@/components/StaminaPickerBottomSheet";
import DayStructurePickerBottomSheet from "@/components/DayStructurePickerBottomSheet";
import PriorityPickerBottomSheet from "@/components/PriorityPickerBottomSheet";

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
    const insets = useSafeAreaInsets();
    const { user } = useUserStore();
    const { setError } = useAppContext();
    const { data: userData, isPending, isError } = useGetUserQuery(user?.uid);
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
        if (!user?.uid) return;
        
        const updateField = selectedTimeType === "start" ? "onboardingInfo.startDayTime" : "onboardingInfo.endDayTime";
        updatePreferences({
            uid: user.uid,
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
        if (!user?.uid) return;

        updatePreferences({
            uid: user.uid,
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
        if (!user?.uid) return;

        updatePreferences({
            uid: user.uid,
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
        if (!user?.uid) return;

        updatePreferences({
            uid: user.uid,
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

    const dayStructure = convertDayStructureToStr(userData.onboardingInfo.dayStructure);
    const priorityActivities = convertActivityTypeToStr(userData.onboardingInfo.priorityActivities);
    
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
            icon: <MaterialIcons name="priority-high" size={22} style={tw`text-gray-600`} />,
            label: "Priorities",
            value: priorityActivities.length > 2 ? 
                priorityActivities.slice(0, 2).join(", ") + "..." :
                (priorityActivities.length > 0 ? priorityActivities.join(", ") : "..."),
            onPress: () => setPriorityPickerVisible(true)
        },
        {
            icon: <Ionicons name="time-outline" size={22} style={tw`text-gray-600`} />,
            label: "Day structure",
            value: dayStructure,
            onPress: () => setDayStructurePickerVisible(true)
        }
    ];

    return (
        <View style={tw`flex-1 bg-purple-50`}>
            <View style={[tw`bg-purple-50`, { paddingTop: insets.top }]} />
            <View style={[tw`flex-1 bg-zinc-100 rounded-t-3xl`, styles.containerShadow]}>
                <View style={tw`px-4 py-6`}>
                    <View style={tw`flex-row justify-between items-center mb-8`}>
                        <View style={tw`w-1/3`}>
                            <TouchableOpacity 
                                onPress={() => router.back()}
                                style={tw`mr-4`}
                            >
                                <Ionicons name="chevron-back" size={24} style={tw`text-gray-950`} />
                            </TouchableOpacity>
                        </View>
                        <Text style={tw`text-2xl font-semibold`}>Preferences</Text>
                        <View style={tw`w-1/3`} />
                    </View>

                    {preferences.map((pref, index) => (
                        <PreferenceRow key={index} {...pref} />
                    ))}
                </View>
            </View>

            <TimePickerBottomSheet
                visible={timePickerVisible}
                onClose={() => {
                    setTimePickerVisible(false);
                    setSelectedTimeType(null);
                }}
                title={selectedTimeType === "start" ? "Start time" : "End time"}
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
        </View>
    );
};

const styles = StyleSheet.create({
    containerShadow: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
});

export default PreferencesScreen;
