import { useEffect } from "react";
import {
    Modal,
    View,
    Text,
    TouchableWithoutFeedback,
    TouchableOpacity,
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
import ActivityIcon from "@/components/ui/ActivityIcon";

const { height: screenHeight } = Dimensions.get("window");

const ACTIVITY_TYPES: ActivityType[] = [
    "focus_work",
    "collaborative_work",
    "repetitive_tasks",
    "health_fitness",
    "food",
    "recreation",
    "education",
    "life_maintenance",
    "misc"
];

const ActivityTypeToStr: Record<ActivityType, string> = {
    "focus_work": "Focus Work",
    "collaborative_work": "Collaborative Work",
    "repetitive_tasks": "Repetitive Tasks",
    "health_fitness": "Health & Fitness",
    "food": "Food",
    "recreation": "Recreation",
    "education": "Education",
    "life_maintenance": "Life Maintenance",
    "misc": "Misc"
};

interface Props {
    visible: boolean;
    onClose: () => void;
    onTypeSelected: (_type: ActivityType) => void;
    selectedType: ActivityType;
}

const ActivityTypePickerBottomSheet = ({
    visible,
    onClose,
    onTypeSelected,
    selectedType,
}: Props) => {
    const translateY = useSharedValue(screenHeight);

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
                translateY.value = withTiming(screenHeight, { duration: 300 }, () => {
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
        translateY.value = withTiming(screenHeight, { duration: 200 }, () => {
            runOnJS(onClose)();
        });
    };

    const handleTypeSelect = (type: ActivityType) => {
        translateY.value = withTiming(screenHeight, { duration: 200 }, () => {
            runOnJS(onTypeSelected)(type);
            runOnJS(onClose)();
        });
    };

    return (
        <Modal visible={visible} transparent animationType="none">
            <TouchableWithoutFeedback onPress={handleOutsidePress}>
                <View style={tw`flex-1 bg-black/40`} />
            </TouchableWithoutFeedback>

            <GestureDetector gesture={panGesture}>
                <Animated.View style={[tw`absolute left-0 right-0 bottom-0 bg-white rounded-t-3xl pb-8`, animatedStyle]}>
                    <View style={tw`items-center pt-4 mb-4`}>
                        <View style={tw`w-12 h-1.5 rounded-full bg-gray-600`} />
                    </View>

                    <Text style={tw`text-2xl font-semibold text-gray-950 mb-6 px-6`}>Activity Type</Text>

                    <View style={tw`flex-row flex-wrap px-4`}>
                        {ACTIVITY_TYPES.map((type) => (
                            <TouchableOpacity
                                key={type}
                                style={tw`w-1/3 items-center mb-6`}
                                onPress={() => handleTypeSelect(type)}
                            >
                                <View style={tw`items-center`}>
                                    <View style={[
                                        tw`w-16 h-16 rounded-2xl items-center justify-center mb-2`,
                                        type === selectedType ? tw`bg-purple-100` : tw`bg-gray-100`
                                    ]}>
                                        <ActivityIcon
                                            activityType={type}
                                            activityPriority="must_do"
                                            iconSize={28}
                                        />
                                    </View>
                                    <Text style={tw`text-sm text-gray-600 text-center px-2`}>
                                        {ActivityTypeToStr[type]}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                </Animated.View>
            </GestureDetector>
        </Modal>
    );
};

export default ActivityTypePickerBottomSheet; 