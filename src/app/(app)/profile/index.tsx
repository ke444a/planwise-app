import { View, Text, TouchableOpacity } from "react-native";
import tw from "twrnc";
import { useUserStore } from "@/libs/userStore";
import Ionicons from "@expo/vector-icons/Ionicons";
import Feather from "@expo/vector-icons/Feather";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import ScreenWrapper from "@/components/ui/ScreenWrapper";

const ProfileScreen = () => {
    const { user } = useUserStore();

    return (
        <ScreenWrapper>
            <View style={tw`px-4 py-6`}>
                <View style={tw`flex-row items-center justify-between mb-8`}>
                    {/* <Text style={tw`text-2xl font-semibold`}>My Profile</Text>
                    <TouchableOpacity onPress={() => router.back()}>
                        <AntDesign name="closecircle" size={24} style={tw`text-gray-500`} />
                    </TouchableOpacity> */}
                    <TouchableOpacity onPress={() => router.back()} style={tw`flex-row items-center gap-x-2`}>
                        <Ionicons name="chevron-back" size={24} style={tw`text-gray-600 dark:text-neutral-100`} />
                        <Text style={tw`text-2xl font-semibold text-gray-950 dark:text-white`}>My Profile</Text>
                    </TouchableOpacity>
                </View>
                <View style={tw`flex-row items-start mb-6`}>
                    <View style={tw`w-14 h-14 bg-slate-200 rounded-xl justify-center items-center mr-4`}>
                        <Ionicons name="person" size={32} style={tw`text-gray-950`} />
                    </View>
                    <View>
                        <Text style={tw`text-xl font-semibold text-gray-950 mb-1 dark:text-white`}>{user?.fullName || "User"}</Text>
                        <Text style={tw`text-gray-500 font-medium dark:text-gray-300`}>{user?.email}</Text>
                    </View>
                </View>

                <TouchableOpacity 
                    style={tw`flex-row items-center p-3 bg-white border border-gray-200 rounded-t-xl`}
                    onPress={() => router.push("/profile/settings")}
                >
                    <MaterialIcons name="app-settings-alt" size={20} style={tw`text-gray-600`} />
                    <Text style={tw`text-lg font-medium ml-1`}>Preferences</Text>
                    <Ionicons name="chevron-forward" size={20} style={tw`ml-auto text-gray-500`} />
                </TouchableOpacity>

                <TouchableOpacity style={tw`flex-row items-center p-3 bg-white border border-gray-200 border-t-0 rounded-none`} onPress={() => router.push("/profile/accessibility")}>
                    <MaterialIcons name="accessibility" size={20} style={tw`text-gray-600`} />
                    <Text style={tw`text-lg font-medium ml-1`}>Accessibility</Text>
                    <Ionicons name="chevron-forward" size={20} style={tw`ml-auto text-gray-500`} />
                </TouchableOpacity>

                <TouchableOpacity style={tw`flex-row items-center p-3 bg-white border border-t-0 border-gray-200 rounded-b-xl`} onPress={() => router.push("/profile/advanced")}>
                    <Feather name="database" size={20} style={tw`text-gray-600`} />
                    <Text style={tw`text-lg font-medium ml-1`}>Advanced</Text>
                    <Ionicons name="chevron-forward" size={20} style={tw`ml-auto text-gray-500`} />
                </TouchableOpacity>

                {/* <Text style={tw`text-lg font-semibold mt-6 mb-4`}>Productivity</Text>
                <View style={tw`flex-row flex-wrap gap-4`}>
                    {stats.map((stat, index) => (
                        <StatCard key={index} {...stat} />
                    ))}
                </View> */}
            </View>
        </ScreenWrapper>
    );
};

// Helper function to format activity type for display
// const formatActivityType = (type: ActivityType): string => {
//     return type
//         .split("_")
//         .map(word => word.charAt(0).toUpperCase() + word.slice(1))
//         .join(" ");
// };

export default ProfileScreen;