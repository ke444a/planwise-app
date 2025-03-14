import { Text, View, Pressable } from "react-native";
import type { ReactNode } from "react";
import tw from "twrnc";
import Animated from "react-native-reanimated";
import { useButtonPressAnimation } from "../hooks/useButtonAnimation";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface BaseButtonProps {
    onPress: () => void;
    children: ReactNode;
    variant?: "primary" | "secondary";
    fullWidth?: boolean;
    disabled?: boolean;
}

interface ButtonWithIconProps extends Omit<BaseButtonProps, "children"> {
    icon?: ReactNode;
    iconPosition?: "left" | "right";
    label: string;
}

export const BaseButton = ({
    onPress,
    children,
    variant = "primary",
    fullWidth = false,
    disabled = false,
}: BaseButtonProps) => {
    const { handlePressIn, handlePressOut, animatedStyles } = useButtonPressAnimation();

    return (
        <AnimatedPressable
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            disabled={disabled}
            style={[
                tw`
                    ${fullWidth ? "w-full" : "w-auto"}
                    ${variant === "primary" ? "bg-purple-100" : "bg-white"}
                    rounded-2xl border-2 border-purple-100 shadow-purple-400
                    ${disabled ? "opacity-50" : "opacity-100"}
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
                    style={tw`font-bold text-lg tracking-wider`}
                >
                    {label}
                </Text>
            </View>
        </BaseButton>
    );
};
