import { View, Text, TouchableOpacity } from "react-native";
import tw from "twrnc";
import { router } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTheme } from "@/context/ThemeContext";
import ScreenWrapper from "@/components/ui/ScreenWrapper";

const AccessibilityScreen = () => {
    const { setSpecificTheme } = useTheme();

    return (
        <ScreenWrapper>
            <View style={tw`px-4 py-6`}>
                <TouchableOpacity onPress={() => router.back()} style={tw`flex-row items-center gap-x-2 mb-8`}>
                    <Ionicons name="chevron-back" size={24} style={tw`text-gray-600 dark:text-neutral-100`} />
                    <Text style={tw`text-2xl font-semibold text-gray-950 dark:text-white`}>Accessibility</Text>
                </TouchableOpacity>

                <View style={tw`mb-6`}>
                    <Text style={tw`text-lg font-medium text-gray-950 mb-4 dark:text-white`}>Background color</Text>
                    
                    <View style={tw`flex-row items-center justify-between w-full`}>
                        {/* Light Theme Option */}
                        <TouchableOpacity 
                            onPress={() => setSpecificTheme("light")}
                            style={tw`items-center`}
                        >
                            <View style={tw`h-32 w-48 rounded-3xl bg-white border-2 border-purple-200 mb-4 dark:border-0`}>
                            </View>
                            <View style={tw`px-6 py-2 rounded-full bg-purple-100 dark:bg-transparent`}>
                                <Text style={tw`text-xl font-medium text-gray-950 dark:text-white`}>Light</Text>
                            </View>
                        </TouchableOpacity>
                        
                        {/* Dark Theme Option */}
                        <TouchableOpacity 
                            onPress={() => setSpecificTheme("dark")}
                            style={tw`items-center`}
                        >
                            <View style={tw`h-32 w-48 rounded-3xl bg-gray-500 dark:border-2 dark:border-purple-200 mb-4`}>
                            </View>
                            <View style={tw`px-6 py-2 rounded-full dark:bg-purple-100 bg-transparent`}>
                                <Text style={tw`text-xl font-medium text-gray-950`}>Dark</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </ScreenWrapper>
    );
};

export default AccessibilityScreen;
