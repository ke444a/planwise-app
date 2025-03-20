import { useEffect, useState, useCallback } from "react";
import {
    Modal,
    View,
    Text,
    TouchableWithoutFeedback,
    Dimensions,
    ScrollView,
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

const { height: screenHeight } = Dimensions.get("window");

// Layout constants
const ITEM_HEIGHT = 48;
const VISIBLE_COUNT = 5;
const PICKER_HEIGHT = ITEM_HEIGHT * VISIBLE_COUNT;
const HOURS_COLUMN_WIDTH = 65;
const MINUTES_COLUMN_WIDTH = 65;
const SUFFIX_WIDTH = 25;
const COLUMN_GAP = 36;
const SUFFIX_GAP = 12;
const CONTAINER_WIDTH = HOURS_COLUMN_WIDTH + SUFFIX_WIDTH + COLUMN_GAP + MINUTES_COLUMN_WIDTH + SUFFIX_WIDTH + 48;

interface Props {
  visible: boolean;
  onClose: () => void;
  onDurationSelected: (_totalMinutes: number) => void;
  initialHours: number;
  initialMinutes: number;
}

const DurationPickerBottomSheet = ({
    visible,
    onClose,
    onDurationSelected,
    initialHours,
    initialMinutes,
}: Props) => {
    const translateY = useSharedValue(screenHeight);
    const [selectedHour, setSelectedHour] = useState(initialHours);
    const [selectedMinute, setSelectedMinute] = useState(initialMinutes);

    useEffect(() => {
        if (visible) {
            translateY.value = withTiming(0, { duration: 300 });
        }
    }, [visible, translateY]);

    const panGesture = Gesture.Pan()
        .onUpdate((event) => {
            // Only allow downward drag
            if (event.translationY > 0) {
                translateY.value = event.translationY;
            }
        })
        .onEnd((event) => {
            // If dragged > 100px, dismiss
            if (event.translationY > 100) {
                translateY.value = withTiming(screenHeight, { duration: 300 }, () => {
                    runOnJS(onClose)();
                });
            } else {
                // Otherwise snap back
                translateY.value = withTiming(0, { duration: 300 });
            }
        });

    // Animated style for the sheet
    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }],
    }));

    // Arrays for hours & minutes
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const minutes = Array.from({ length: 60 }, (_, i) => i);

    // Close when tapping outside
    const handleOutsidePress = () => {
        const total = selectedHour * 60 + selectedMinute;
        translateY.value = withTiming(screenHeight, { duration: 200 }, () => {
            runOnJS(onDurationSelected)(total);
            runOnJS(onClose)();
        });
    };

    // Called when user scrolls hours
    const onHoursMomentumScrollEnd = useCallback((e: any) => {
        const index = Math.round(e.nativeEvent.contentOffset.y / ITEM_HEIGHT);
        setSelectedHour(hours[index]);
    }, [hours]);

    // Called when user scrolls minutes
    const onMinutesMomentumScrollEnd = useCallback((e: any) => {
        const index = Math.round(e.nativeEvent.contentOffset.y / ITEM_HEIGHT);
        setSelectedMinute(minutes[index]);
    }, [minutes]);

    // Confirm button action
    // const handleConfirm = () => {
    //     const total = selectedHour * 60 + selectedMinute;
    //     translateY.value = withTiming(screenHeight, { duration: 300 }, () => {
    //         runOnJS(onDurationSelected)(total);
    //         runOnJS(onClose)();
    //     });
    // };

    // Render each hour item
    const renderHourItem = useCallback((value: number) => {
        const isSelected = value === selectedHour;
        const textColor = isSelected ? "text-gray-950" : "text-gray-600";

        return (
            <View key={value} style={tw`h-[${ITEM_HEIGHT}px] justify-center items-center`}>
                <Text style={tw`${textColor} text-xl font-medium`}>
                    {value}
                </Text>
            </View>
        );
    }, [selectedHour]);

    // Render each minute item
    const renderMinuteItem = useCallback((value: number) => {
        const displayVal = value < 10 ? `0${value}` : `${value}`;
        const isSelected = value === selectedMinute;
        const textColor = isSelected ? "text-gray-950" : "text-gray-600";

        return (
            <View key={value} style={tw`h-[${ITEM_HEIGHT}px] justify-center items-center`}>
                <Text style={tw`${textColor} text-xl font-medium`}>
                    {displayVal}
                </Text>
            </View>
        );
    }, [selectedMinute]);

    return (
        <Modal visible={visible} transparent animationType="none">
            {/* Background overlay to detect outside taps */}
            <TouchableWithoutFeedback onPress={handleOutsidePress}>
                <View style={tw`flex-1 bg-black/40`} />
            </TouchableWithoutFeedback>

            <GestureDetector gesture={panGesture}>
                <Animated.View style={[tw`absolute left-0 right-0 bottom-0 bg-white rounded-t-3xl pb-8`, animatedStyle]}>
                    {/* Small handle bar at the top */}
                    <View style={tw`items-center pt-4 mb-4`}>
                        <View style={tw`w-12 h-1.5 rounded-full bg-gray-600`} />
                    </View>

                    {/* Hours & minutes side-by-side */}
                    <View style={tw`flex-row justify-center mt-3 h-[${PICKER_HEIGHT}px]`}>
                        <View style={tw`relative w-[${CONTAINER_WIDTH}px] h-[${PICKER_HEIGHT}px] flex-row justify-center`}>
                            {/* Hours column with fixed suffix */}
                            <View style={tw`flex-row items-center mx-[${COLUMN_GAP / 2}px]`}>
                                <ScrollView
                                    style={{ width: HOURS_COLUMN_WIDTH }}
                                    snapToInterval={ITEM_HEIGHT}
                                    decelerationRate="fast"
                                    showsVerticalScrollIndicator={false}
                                    contentContainerStyle={{
                                        paddingVertical: (PICKER_HEIGHT - ITEM_HEIGHT) / 2,
                                    }}
                                    onMomentumScrollEnd={onHoursMomentumScrollEnd}
                                    contentOffset={{ x: 0, y: initialHours * ITEM_HEIGHT }}
                                >
                                    {hours.map(renderHourItem)}
                                </ScrollView>
                                <Text style={tw`text-xl font-medium text-gray-950 ml-[${SUFFIX_GAP}px] w-[${SUFFIX_WIDTH}px]`}>h</Text>
                            </View>

                            {/* Minutes column with fixed suffix */}
                            <View style={tw`flex-row items-center mx-[${COLUMN_GAP / 2}px]`}>
                                <ScrollView
                                    style={{ width: MINUTES_COLUMN_WIDTH }}
                                    snapToInterval={ITEM_HEIGHT}
                                    decelerationRate="fast"
                                    showsVerticalScrollIndicator={false}
                                    contentContainerStyle={{
                                        paddingVertical: (PICKER_HEIGHT - ITEM_HEIGHT) / 2,
                                    }}
                                    onMomentumScrollEnd={onMinutesMomentumScrollEnd}
                                    contentOffset={{ x: 0, y: initialMinutes * ITEM_HEIGHT }}
                                >
                                    {minutes.map(renderMinuteItem)}
                                </ScrollView>
                                <Text style={tw`text-xl font-medium text-gray-950 ml-[${SUFFIX_GAP}px] w-[${SUFFIX_WIDTH}px]`}>m</Text>
                            </View>

                            {/* Translucent highlight overlay */}
                            <View
                                style={tw`absolute h-[${ITEM_HEIGHT}px] bg-purple-100 rounded-xl top-[${(PICKER_HEIGHT - ITEM_HEIGHT) / 2}px] left-0 w-[${CONTAINER_WIDTH}px] -z-10`}
                            />
                        </View>
                    </View>
                </Animated.View>
            </GestureDetector>
        </Modal>
    );
};

export default DurationPickerBottomSheet;