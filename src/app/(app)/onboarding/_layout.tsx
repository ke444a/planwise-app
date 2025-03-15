import { Slot } from "expo-router";
import tw from "twrnc";
import { View } from "react-native";

export default function OnboardingLayout() {
    return (
        <View style={tw`flex-1`}>
            <Slot />
        </View>
    );
}
