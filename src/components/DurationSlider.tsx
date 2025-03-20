import React, { useCallback, useEffect } from "react";
import { View, TouchableOpacity, Dimensions } from "react-native";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    runOnJS,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import tw from "twrnc";

interface DurationOption {
  value: number;
  label: string;
}

interface DurationSliderProps {
  options: DurationOption[];
  initialValue?: number;
  onValueChange?: (_value: number) => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SPRING_CONFIG = {
    damping: 15,
    mass: 0.5,
    stiffness: 100,
};

const DurationSlider: React.FC<DurationSliderProps> = ({
    options,
    initialValue,
    onValueChange,
}) => {
    const translateX = useSharedValue(0);
    const selectedIndex = useSharedValue(0);
    const contextX = useSharedValue(0);

    useEffect(() => {
        if (initialValue !== undefined) {
            const index = options.findIndex(option => option.value === initialValue);
            if (index !== -1) {
                const containerWidth = SCREEN_WIDTH - 32;
                const optionWidth = containerWidth / options.length;
                translateX.value = index * optionWidth;
                selectedIndex.value = index;
            }
        }
    }, [initialValue, options, translateX, selectedIndex]);

    const calculateNewIndex = useCallback((x: number) => {
        "worklet";
        const containerWidth = SCREEN_WIDTH - 32;
        const optionWidth = containerWidth / options.length;
        const newIndex = Math.round(x / optionWidth);
        return Math.max(0, Math.min(newIndex, options.length - 1));
    }, [options.length]);

    const updateSelection = useCallback((index: number) => {
        const containerWidth = SCREEN_WIDTH - 32;
        const optionWidth = containerWidth / options.length;
        translateX.value = withSpring(index * optionWidth, SPRING_CONFIG);
        selectedIndex.value = index;
        onValueChange?.(options[index].value);
    }, [options, onValueChange, selectedIndex, translateX]);

    const gesture = Gesture.Pan()
        .onStart(() => {
            contextX.value = translateX.value;
        })
        .onUpdate((event) => {
            const containerWidth = SCREEN_WIDTH - 32;
            const maxTranslate = containerWidth - (containerWidth / options.length);
            translateX.value = Math.max(
                0,
                Math.min(contextX.value + event.translationX, maxTranslate)
            );
        })
        .onEnd(() => {
            const newIndex = calculateNewIndex(translateX.value);
            runOnJS(updateSelection)(newIndex);
        });

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.value }],
    }));

    const handlePress = useCallback((index: number) => {
        updateSelection(index);
    }, [updateSelection]);

    return (
        <View style={tw`w-full`}>
            <GestureDetector gesture={gesture}>
                <View style={tw`relative h-12 rounded-lg bg-slate-100 overflow-hidden`}>
                    <Animated.View
                        style={[
                            tw`absolute h-12 rounded-lg bg-purple-100`,
                            { width: `${100 / options.length}%` },
                            animatedStyle,
                        ]}
                    />
                    <View style={tw`flex-row h-full`}>
                        {options.map((option, index) => (
                            <TouchableOpacity
                                key={option.value}
                                style={tw`flex-1 items-center justify-center`}
                                onPress={() => handlePress(index)}
                            >
                                <Animated.Text
                                    style={[
                                        tw`text-base font-medium`,
                                        selectedIndex.value === index ? tw`text-purple-500` : tw`text-gray-950`,
                                    ]}
                                >
                                    {option.label}
                                </Animated.Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </GestureDetector>
        </View>
    );
};

export default DurationSlider;
