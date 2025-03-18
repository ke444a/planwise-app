import React, { useState } from "react";
import { View, Text, TouchableOpacity, TouchableWithoutFeedback } from "react-native";
import tw from "twrnc";
import { Ionicons, MaterialCommunityIcons, FontAwesome6, FontAwesome5 } from "@expo/vector-icons";
import { getActivityDurationLabel } from "@/utils/getActivityDurationLabel";
import Animated, { 
    useAnimatedStyle, 
    withTiming, 
    useSharedValue,
    interpolate,
    Easing,
    withSpring
} from "react-native-reanimated";

const getIconComponent = (activityType: ActivityType, activityPriority: ActivityPriority, iconSize: number = 24) => {
    const iconColor: Record<ActivityPriority, string> = {
        "must_do": "text-rose-400",
        "get_it_done": "text-orange-400",
        "nice_to_have": "text-blue-500",
        "routine": "text-blue-500",
    };

    const iconComponent: Record<ActivityType, React.ReactNode> = {
        "focus_work": <FontAwesome5 name="brain" size={iconSize} style={tw`${iconColor[activityPriority]}`} />,
        "collaborative_work": <Ionicons name="people" size={iconSize} style={tw`${iconColor[activityPriority]}`} />,
        "repetitive_tasks": <FontAwesome6 name="repeat" size={iconSize} style={tw`${iconColor[activityPriority]}`} />,
        "health_fitness": <MaterialCommunityIcons name="weight-lifter" size={iconSize} style={tw`${iconColor[activityPriority]}`} />,
        "food": <FontAwesome5 name="utensils" size={iconSize} style={tw`${iconColor[activityPriority]}`} />,
        "recreation": <MaterialCommunityIcons name="meditation" size={iconSize} style={tw`${iconColor[activityPriority]}`} />,
        "education": <FontAwesome5 name="book" size={iconSize} style={tw`${iconColor[activityPriority]}`} />,
        "life_maintenance": <FontAwesome6 name="screwdriver-wrench" size={iconSize} style={tw`${iconColor[activityPriority]}`} />,
        "misc": <MaterialCommunityIcons name="help" size={iconSize} style={tw`${iconColor[activityPriority]}`} />,
    };

    return iconComponent[activityType];
};

const getPriorityLabel = (priority: ActivityPriority) => {
    switch (priority) {
    case "must_do":
        return "🔥 Must Do Now";
    case "get_it_done":
        return "⚡️ Get It Done";
    case "nice_to_have":
        return "💙 Nice to Do";
    case "routine":
        return "🔄 Routine";
    }
};

interface ActivityItemProps {
    activity: IActivity;
}

export const ActivityItem = ({ activity }: ActivityItemProps) => {
    const [showOptions, setShowOptions] = useState(false);
    const [isRemoved, setIsRemoved] = useState(false);
    const animation = useSharedValue(0);
    const pressAnimation = useSharedValue(1);

    const handlePressIn = () => {
        pressAnimation.value = withSpring(0.97, {
            damping: 15,
            stiffness: 400,
        });
    };

    const handlePressOut = () => {
        pressAnimation.value = withSpring(1, {
            damping: 15,
            stiffness: 400,
        });
    };

    const handleToggleOptions = () => {
        if (!isRemoved) {
            setShowOptions(!showOptions);
            animation.value = withTiming(showOptions ? 0 : 1, {
                duration: 200,
                easing: Easing.bezier(0.4, 0, 0.2, 1),
            });
        }
    };

    const pressStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { scale: pressAnimation.value },
                { translateY: interpolate(pressAnimation.value, [0.97, 1], [1, 0]) }
            ]
        };
    });

    const optionsStyle = useAnimatedStyle(() => {
        return {
            opacity: animation.value,
            height: interpolate(
                animation.value,
                [0, 1],
                [0, 60],
            ),
            transform: [{
                translateY: interpolate(
                    animation.value,
                    [0, 1],
                    [-20, 0],
                ),
            }],
        };
    });

    const handleAdd = () => {
        // To be implemented
    };

    const handleRemove = () => {
        setIsRemoved(true);
        setShowOptions(false);
        animation.value = withTiming(0, {
            duration: 200,
            easing: Easing.bezier(0.4, 0, 0.2, 1),
        });
    };

    const handleBacklog = () => {
        // To be implemented
    };

    return (
        <View>
            <TouchableWithoutFeedback 
                onPress={handleToggleOptions}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
            >
                <Animated.View style={[pressStyle]}>
                    <View style={[
                        tw`flex-row items-center bg-slate-200 rounded-xl p-3`, 
                        showOptions && tw`rounded-b-none`,
                        isRemoved && tw`bg-slate-100`
                    ]}>
                        {getIconComponent(activity.type, activity.priority, 32)}

                        {/* Content */}
                        <View style={tw`flex-1 ml-4`}>
                            <Text style={[
                                tw`text-gray-950 font-semibold text-base mb-1`,
                                isRemoved && tw`line-through text-gray-400`
                            ]}>
                                {activity.title}
                            </Text>

                            {!isRemoved && (
                                <>
                                    <Text style={tw`text-gray-500 text-sm mb-1`}>
                                        {activity.startTime}-{activity.endTime} ({getActivityDurationLabel(activity.duration)})
                                    </Text>

                                    {/* Bottom row with stamina and priority */}
                                    <View style={tw`flex-row flex-wrap gap-2 items-center`}>
                                        <View style={tw`flex-row items-center rounded-full p-1 border border-gray-500`}>
                                            <Text style={tw`text-gray-500 font-medium mr-1 text-sm`}>{activity.staminaCost}</Text>
                                            <Ionicons name="flash" size={14} style={tw`text-gray-500`} />
                                        </View>
                                        {activity.priority !== "routine" && (
                                            <View style={tw`rounded-full p-1 border border-gray-500`}>
                                                <Text style={tw`font-medium text-gray-500 text-sm`}>
                                                    {getPriorityLabel(activity.priority)}
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                </>
                            )}
                        </View>
                    </View>
                </Animated.View>
            </TouchableWithoutFeedback>

            <Animated.View style={[tw`overflow-hidden`, optionsStyle]}>
                <View style={tw`flex-row justify-between p-2 bg-gray-400 rounded-b-xl`}>
                    <TouchableOpacity 
                        onPress={handleAdd}
                        style={tw`flex-1 bg-white rounded-lg py-3 mx-1 items-center flex-row justify-center`}
                    >
                        <Ionicons name="add" size={20} style={tw`text-gray-950 mr-1`} />
                        <Text style={tw`text-gray-950 font-medium`}>Add</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        onPress={handleRemove}
                        style={tw`flex-1 bg-white rounded-lg py-3 mx-1 items-center flex-row justify-center`}
                    >
                        <Ionicons name="close" size={20} style={tw`text-gray-950 mr-1`} />
                        <Text style={tw`text-gray-950 font-medium`}>Remove</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        onPress={handleBacklog}
                        style={tw`flex-1 bg-white rounded-lg py-3 mx-1 items-center flex-row justify-center`}
                    >
                        <MaterialCommunityIcons name="clock-outline" size={20} style={tw`text-gray-950 mr-1`} />
                        <Text style={tw`text-gray-950 font-medium`}>Backlog</Text>
                    </TouchableOpacity>
                </View>
            </Animated.View>
        </View>
    );
}; 