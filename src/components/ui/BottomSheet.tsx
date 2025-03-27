import { useEffect } from "react";
import {
    Modal,
    View,
    TouchableWithoutFeedback,
    Dimensions,
} from "react-native";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    runOnJS,
} from "react-native-reanimated";
import {
    Gesture,
    GestureDetector,
} from "react-native-gesture-handler";
import tw from "twrnc";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

interface Props {
    visible: boolean;
    onClose: () => void;
    children: React.ReactNode;
}

/**
 * Generic modal component that triggers a sheet appearing from the bottom of the screen.
 * The sheet can be closed by dragging it down or by pressing the outside of the sheet.
 */
const BottomSheet = ({ visible, onClose, children }: Props) => {
    const translateY = useSharedValue(SCREEN_HEIGHT);

    useEffect(() => {
        if (visible) {
            translateY.value = withTiming(0, { duration: 300 });
        }
    }, [visible, translateY]);

    const panGesture = Gesture.Pan()
        .onUpdate((event) => {
            if (event.translationY > 0) {
                translateY.value = event.translationY;
            }
        })
        .onEnd((event) => {
            if (event.translationY > 100) {
                translateY.value = withTiming(SCREEN_HEIGHT, { duration: 300 }, () => {
                    runOnJS(onClose)();
                });
            } else {
                translateY.value = withTiming(0, { duration: 300 });
            }
        });

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }],
    }));

    const handleOutsidePress = () => {
        translateY.value = withTiming(SCREEN_HEIGHT, { duration: 300 }, () => {
            runOnJS(onClose)();
        });
    };

    return (
        <Modal visible={visible} transparent animationType="none">
            <TouchableWithoutFeedback onPress={handleOutsidePress}>
                <View style={tw`flex-1 bg-black/30`} />
            </TouchableWithoutFeedback>

            <GestureDetector gesture={panGesture}>
                <Animated.View style={[tw`absolute left-0 right-0 bottom-0 bg-white rounded-t-3xl pb-8`, animatedStyle]}>
                    <View style={tw`items-center pt-4 mb-8`}>
                        <View style={tw`w-12 h-1.5 rounded-full bg-gray-600`} />
                    </View>
                    {children}
                </Animated.View>
            </GestureDetector>
        </Modal>
    );
};

export default BottomSheet; 