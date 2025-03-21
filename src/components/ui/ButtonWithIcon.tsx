import { Text, View, Pressable } from "react-native";
import type { ReactNode } from "react";
import tw from "twrnc";
import Animated from "react-native-reanimated";
import { useSharedValue, useAnimatedStyle, withTiming } from "react-native-reanimated";
import { useState } from "react";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface BaseButtonProps {
    onPress: () => void;
    children: ReactNode;
    variant?: "primary" | "secondary" | "error";
    fullWidth?: boolean;
    disabled?: boolean;
}

interface ButtonWithIconProps extends Omit<BaseButtonProps, "children"> {
    icon?: ReactNode;
    iconPosition?: "left" | "right";
    label: string;
}

type Props = {
    shadowOffsetHeight: number;
};

export const useButtonPressAnimation = (props?: Props) => {
    const shadowOffsetHeight = props?.shadowOffsetHeight || 6;
    const translateY = useSharedValue(0);
    const shadowHeight = useSharedValue(shadowOffsetHeight);

    const animatedStyles = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }],
        shadowOffset: { width: 0, height: shadowHeight.value },
        shadowOpacity: 1,
        shadowRadius: 0
    }));

    const handlePressIn = () => {
        translateY.value = withTiming(shadowOffsetHeight, { duration: 200 });
        shadowHeight.value = withTiming(0, { duration: 200 });
    };

    const handlePressOut = () => {
        translateY.value = withTiming(0, { duration: 200 });
        shadowHeight.value = withTiming(shadowOffsetHeight, { duration: 200 });
    };

    return {
        animatedStyles,
        handlePressIn,
        handlePressOut,
    };
};

export const BaseButton = ({
    onPress,
    children,
    variant = "primary",
    fullWidth = false,
    disabled = false,
}: BaseButtonProps) => {
    const { handlePressIn, handlePressOut, animatedStyles } = useButtonPressAnimation();
    const [isDebouncing, setIsDebouncing] = useState(false);

    const handlePress = () => {
        if (isDebouncing) return;
        
        setIsDebouncing(true);
        onPress();
        
        setTimeout(() => {
            setIsDebouncing(false);
        }, 200);
    };

    const colors = {
        primary: {
            backgroundColor: "bg-purple-100",
            borderColor: "border-purple-200",
            shadowColor: "shadow-purple-400"
        },
        secondary: {
            backgroundColor: "bg-white",
            borderColor: "border-purple-200",
            shadowColor: "shadow-purple-400"
        },
        error: {
            backgroundColor: "bg-red-100",
            borderColor: "border-red-200",
            shadowColor: "shadow-red-400"
        }
    };

    return (
        <AnimatedPressable
            onPress={handlePress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            disabled={disabled || isDebouncing}
            style={[
                tw`
                    ${fullWidth ? "w-full" : "w-auto"}
                    ${colors[variant].backgroundColor}
                    rounded-2xl border-2 ${colors[variant].borderColor} ${colors[variant].shadowColor}
                    ${(disabled || isDebouncing) ? "opacity-50" : "opacity-100"}
                `,
                animatedStyles
            ]}
        >
            <View style={tw`p-4`}>
                {children}
            </View>
        </AnimatedPressable>
    );
};

export const ButtonWithIcon = ({
    onPress,
    icon,
    label,
    iconPosition = "left",
    variant = "primary",
    fullWidth = false,
    disabled = false,
}: ButtonWithIconProps) => {    
    return (
        <BaseButton
            onPress={onPress}
            variant={variant}
            fullWidth={fullWidth}
            disabled={disabled}
        >
            <View
                style={tw`
                    flex-row items-center justify-center
                    ${iconPosition === "right" ? "flex-row-reverse" : "flex-row"}
                `}
            >
                {icon && (
                    <View
                        style={tw`
                            ${iconPosition === "left" ? "mr-2" : "ml-2"}
                        `}
                    >
                        {icon}
                    </View>
                )}
                <Text
                    style={tw`font-medium text-lg tracking-wider`}
                >
                    {label}
                </Text>
            </View>
        </BaseButton>
    );
};
