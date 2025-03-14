import { View, Text } from "react-native";
import { router } from "expo-router";
import tw from "twrnc";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import AntDesign from "@expo/vector-icons/AntDesign";
import AuthButton from "../../components/AuthButton";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Auth() {
    const handleGoogleSignIn = () => {
        router.replace("/(app)");
    };

    return (
        <SafeAreaView style={tw`flex-1 px-6 justify-between py-20`}>
            <View style={tw`items-center mx-auto mt-20`}>
                <MaterialCommunityIcons 
                    name="bullseye-arrow" 
                    style={tw`mb-6 text-gray-400`}
                    size={80}
                />
                <Text style={tw`text-3xl font-bold text-center mb-3 max-w-[80%]`}>
                        Plan Smarter, Live Better!
                </Text>
                <Text style={tw`text-lg text-center max-w-[80%]`}>
                        An easiest way to organize your day - powered by AI
                </Text>
            </View>
            <View style={tw`w-full`}>
                <AuthButton
                    onPress={handleGoogleSignIn}
                    icon={<AntDesign name="google" size={24} color="#1f2937" />}
                    label="Google Sign-In"
                />
            </View>
        </SafeAreaView>
    );
}
