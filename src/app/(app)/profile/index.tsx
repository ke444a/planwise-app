import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import tw from "twrnc";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useUserStore } from "@/config/userStore";
import Ionicons from "@expo/vector-icons/Ionicons";
import AntDesign from "@expo/vector-icons/AntDesign";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import Feather from "@expo/vector-icons/Feather";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { router } from "expo-router";

interface IStatCard {
    value?: string | number;
    label: string;
    icon: React.ReactNode;
    color: string;
    backgroundColor: string;
}

const stats: IStatCard[] = [
    {
        value: "10",
        label: "Total Completed",
        icon: <Feather name="check-circle" size={24} style={tw`text-blue-400`} />,
        backgroundColor: "bg-blue-100",
        color: "text-blue-400"
    },
    {
        value: "10",
        label: "Longest Streak",
        icon: <FontAwesome6 name="fire" size={24} style={tw`text-orange-400`} />,
        backgroundColor: "bg-orange-100",
        color: "text-orange-400"
    },
    {
        value: "",
        label: "Favorite Activity",
        icon: <MaterialCommunityIcons name="bullseye-arrow" size={40} style={tw`text-red-500`} />,
        backgroundColor: "bg-red-100",
        color: "text-red-500"
    },
    {
        value: "12",
        label: "Avg Stamina Per Day",
        icon: <Ionicons name="flash" size={24} style={tw`text-lime-500`} />,
        backgroundColor: "bg-lime-100",
        color: "text-lime-500"
    }
];

const StatCard = ({ value, label, icon, backgroundColor, color }: IStatCard) => (
    <View style={tw`w-[46%] p-4 rounded-xl ${backgroundColor} flex flex-col justify-center items-center h-[135px]`}>
        <View style={tw`flex-row items-center mb-2`}>
            {value && <Text style={[tw`text-3xl font-semibold ${color} mr-2`]}>{value}</Text>}
            {icon}
        </View>
        <Text style={tw`text-gray-950 font-medium text-base text-center max-w-[100px]`}>{label}</Text>
    </View>
);

const ProfileScreen = () => {
    const { user } = useUserStore();
    const insets = useSafeAreaInsets();

    return (
        <View style={tw`flex-1 bg-purple-50`}>
            <View style={[tw`bg-purple-50`, { paddingTop: insets.top }]} />
            <View style={[tw`flex-1 bg-zinc-100 rounded-t-3xl`, styles.containerShadow]}>
                <View style={tw`p-6`}>
                    <View style={tw`flex-row items-center justify-between mb-8`}>
                        <Text style={tw`text-2xl font-semibold`}>Your Profile</Text>
                        <TouchableOpacity onPress={() => router.back()}>
                            <AntDesign name="closecircle" size={32} style={tw`text-gray-500`} />
                        </TouchableOpacity>
                    </View>
                    <View style={tw`flex-row items-start mb-6`}>
                        <View style={tw`w-14 h-14 bg-slate-200 rounded-xl justify-center items-center mr-4`}>
                            <Ionicons name="person" size={32} style={tw`text-gray-950`} />
                        </View>
                        <View>
                            <Text style={tw`text-xl font-semibold text-gray-950 mb-1`}>{user?.fullName || "User"}</Text>
                            <Text style={tw`text-gray-500 font-medium`}>{user?.email}</Text>
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

                    <TouchableOpacity style={tw`flex-row items-center p-3 bg-white border border-t-0 border-gray-200 rounded-b-xl`} onPress={() => router.push("/profile/advanced")}>
                        <Feather name="database" size={20} style={tw`text-gray-600`} />
                        <Text style={tw`text-lg font-medium ml-1`}>Advanced</Text>
                        <Ionicons name="chevron-forward" size={20} style={tw`ml-auto text-gray-500`} />
                    </TouchableOpacity>

                    <Text style={tw`text-lg font-semibold mt-6 mb-4`}>Productivity</Text>
                    <View style={tw`flex-row flex-wrap gap-4`}>
                        {stats.map((stat, index) => (
                            <StatCard key={index} {...stat} />
                        ))}
                    </View>
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

export default ProfileScreen;