import { View, StyleSheet } from "react-native";
import tw from "twrnc";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface ScreenWrapperProps {
    children: React.ReactNode;
}

const ScreenWrapper = ({ children }: ScreenWrapperProps) => {
    const insets = useSafeAreaInsets();

    return (
        <View style={tw`flex-1 bg-purple-50`}>
            <View style={[tw`bg-purple-50`, { paddingTop: insets.top }]} />
            <View style={[
                tw`flex-1 bg-white rounded-t-3xl`,
                styles.containerShadow
            ]}>
                {children}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    containerShadow: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4
    }
});

export default ScreenWrapper;
