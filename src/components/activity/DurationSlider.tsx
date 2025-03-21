import { useCallback, useEffect } from "react";
import { View, TouchableOpacity, Dimensions } from "react-native";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    runOnJS,
    useDerivedValue,
    withTiming,
    SharedValue
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import tw from "twrnc";

interface DurationOption {
  value: number;
  label: string;
}

interface DurationSliderProps {
  options: DurationOption[];
  value?: number;
  defaultValue?: number;
  onValueChange?: (_value: number) => void;
}

interface OptionProps {
    option: DurationOption;
    index: number;
    selectedIndex: SharedValue<number>;
    onPress: (_index: number) => void;
}

const Option = ({ option, index, selectedIndex, onPress }: OptionProps) => {
    const isSelected = useDerivedValue(() => selectedIndex.value === index);
    
    const textStyle = useAnimatedStyle(() => {
        return {
            color: isSelected.value ? "#a855f7" : "#4b5563",
        };
    });

    return (
        <TouchableOpacity
            style={tw`flex-1 items-center justify-center`}
            onPress={() => onPress(index)}
        >
            <Animated.Text
                style={[
                    tw`text-base font-medium`,
                    textStyle,
                ]}
            >
                {option.label}
            </Animated.Text>
        </TouchableOpacity>
    );
};

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SPRING_CONFIG = {
    damping: 15,
    mass: 0.5,
    stiffness: 100,
};

const DurationSlider = ({
    options,
    value,
    defaultValue,
    onValueChange,
}: DurationSliderProps) => {
    const translateX = useSharedValue(0);
    const selectedIndex = useSharedValue(0);
    const contextX = useSharedValue(0);
    const isControlled = value !== undefined;

    const updatePositionFromValue = useCallback((durationValue: number) => {
        const index = options.findIndex(option => option.value === durationValue);
        if (index !== -1) {
            const containerWidth = SCREEN_WIDTH - 32;
            const optionWidth = containerWidth / options.length;
            translateX.value = withSpring(index * optionWidth, SPRING_CONFIG);
            selectedIndex.value = withTiming(index);
        }
    }, [options, translateX, selectedIndex]);

    // Handle controlled and uncontrolled initial values
    useEffect(() => {
        const initialValue = isControlled ? value : defaultValue;
        if (initialValue !== undefined) {
            updatePositionFromValue(initialValue);
        }
    });

    // Handle controlled value updates
    useEffect(() => {
        if (isControlled && value !== undefined) {
            updatePositionFromValue(value);
        }
    }, [value, isControlled, updatePositionFromValue]);

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
        selectedIndex.value = withTiming(index);
        onValueChange?.(options[index].value);
    }, [options, onValueChange]);

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
                            <Option
                                key={option.value}
                                option={option}
                                index={index}
                                selectedIndex={selectedIndex}
                                onPress={updateSelection}
                            />
                        ))}
                    </View>
                </View>
            </GestureDetector>
        </View>
    );
};

export default DurationSlider;
