import { LinearGradient } from "expo-linear-gradient";
import { Slot } from "expo-router";
import { View } from "react-native";
import tw from "twrnc";

export default function AuthLayout() {
    return (
        <View style={tw`flex-1`}>
            <LinearGradient
                colors={["#F9F4F5", "#F3E8FF", "#F9F4F5"]}
                locations={[0.3, 0.5, 0.7]}
                style={tw`absolute w-full h-full`}
            />
            <Slot />
        </View>
    );
}
