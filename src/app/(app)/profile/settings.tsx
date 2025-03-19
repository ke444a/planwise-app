import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import tw from "twrnc";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, Redirect } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useUserStore } from "@/config/userStore";
import { useGetUserQuery } from "@/api/users/getUser";
import { useAppContext } from "@/context/AppContext";

interface IPreferenceRow {
    icon: React.ReactNode;
    label: string;
    value: string;
    showChevron?: boolean;
}

const PreferenceRow = ({ icon, label, value, showChevron = true }: IPreferenceRow) => (
    <TouchableOpacity 
        style={tw`flex-row items-center p-3 bg-white border border-gray-200 rounded-xl mb-3`}
        onPress={() => {}}
    >
        <View style={tw`mr-1`}>{icon}</View>
        <Text style={tw`text-gray-950 text-lg font-medium flex-1`}>{label}</Text>
        <View style={tw`flex-row items-center`}>
            <Text style={tw`text-gray-500 text-lg mr-2`}>{value}</Text>
            {showChevron && (
                <Ionicons name="chevron-forward" size={20} style={tw`text-gray-500`} />
            )}
        </View>
    </TouchableOpacity>
);

const PreferencesScreen = () => {
    const insets = useSafeAreaInsets();
    const { user } = useUserStore();
    const { setError } = useAppContext();
    const { data: userData, isPending, isError } = useGetUserQuery(user?.uid);

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
    
    const preferences: IPreferenceRow[] = [
        {
            icon: <Ionicons name="sunny" size={22} style={tw`text-gray-600`} />,
            label: "Start time",
            value: userData.onboardingInfo.startDayTime
        },
        {
            icon: <Ionicons name="moon" size={22} style={tw`text-gray-600`} />,
            label: "End time",
            value: userData.onboardingInfo.endDayTime
        },
        {
            icon: <MaterialCommunityIcons name="lightning-bolt" size={22} style={tw`text-gray-600`} />,
            label: "Stamina",
            value: userData.maxStamina.toString()
        },
        {
            icon: <MaterialIcons name="priority-high" size={22} style={tw`text-gray-600`} />,
            label: "Priorities",
            value: userData.onboardingInfo.priorityActivities.join(", ")
        },
        {
            icon: <Ionicons name="time-outline" size={22} style={tw`text-gray-600`} />,
            label: "Day structure",
            value: userData.onboardingInfo.dayStructure
        }
    ];

    return (
        <View style={tw`flex-1 bg-purple-50`}>
            <View style={[tw`bg-purple-50`, { paddingTop: insets.top }]} />
            <View style={[tw`flex-1 bg-zinc-100 rounded-t-3xl`, styles.containerShadow]}>
                <View style={tw`p-6`}>
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
