import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, TouchableWithoutFeedback, Alert } from "react-native";
import tw from "twrnc";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import Animated, { 
    useAnimatedStyle, 
    withTiming, 
    useSharedValue,
    interpolate,
    Easing,
    withSpring
} from "react-native-reanimated";
import { useAddItemToBacklogMutation } from "@/api/backlogs/addItemToBacklog";
import { useUserStore } from "@/libs/userStore";
import { createNewSubtask } from "@/utils/createNewSubtask";
import { getActivityDurationLabel } from "@/utils/getActivityDurationLabel";

interface GeneratedBacklogItemProps {
    item: IBacklogItemGenAI;
    onStateChange: (_state: "added" | "removed") => void;
    isAdded: boolean;
}

export const GeneratedBacklogItem = ({ item, onStateChange, isAdded }: GeneratedBacklogItemProps) => {
    const { user } = useUserStore();
    const [showOptions, setShowOptions] = useState(false);
    const [status, setStatus] = useState<"idle" | "added" | "removed">("idle");
    const { mutate: addItemToBacklog } = useAddItemToBacklogMutation();
    const animation = useSharedValue(0);
    const pressAnimation = useSharedValue(1);

    useEffect(() => {
        if (isAdded) {
            setStatus("added");
            setShowOptions(false);
            animation.value = withTiming(0, {
                duration: 200,
                easing: Easing.bezier(0.4, 0, 0.2, 1),
            });
        }
    }, [isAdded, status, animation]);

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
        if (status === "idle") {
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
        if (!user?.uid) return;

        // Create subtasks from the strings if they exist
        const formattedSubtasks = item.subtasks 
            ? item.subtasks.map(subtask => createNewSubtask(subtask))
            : [];

        addItemToBacklog({
            item: {
                title: item.title,
                duration: item.estimated_duration,
                itemType: "draft",
                subtasks: formattedSubtasks,
                isCompleted: false
            },
            uid: user.uid
        }, {
            onSuccess: () => {
                setStatus("added");
                setShowOptions(false);
                animation.value = withTiming(0, {
                    duration: 200,
                    easing: Easing.bezier(0.4, 0, 0.2, 1),
                });
                onStateChange("added");
            },
            onError: () => {
                Alert.alert("Error", "Something went wrong. Please try again.");
            }
        });
    };

    const handleRemove = () => {
        setStatus("removed");
        setShowOptions(false);
        animation.value = withTiming(0, {
            duration: 200,
            easing: Easing.bezier(0.4, 0, 0.2, 1),
        });
        onStateChange("removed");
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
                        tw`flex-row items-center bg-white rounded-xl p-3`, 
                        showOptions && tw`rounded-b-none`
                    ]}>
                        <MaterialCommunityIcons 
                            name="text-box-outline" 
                            size={32}
                            style={tw`text-gray-600`}
                        />
                        {/* Content */}
                        <View style={tw`flex-1 ml-2`}>
                            <View style={tw`flex-row items-center justify-between`}>
                                <Text style={[
                                    tw`text-gray-950 font-semibold text-base mb-1`,
                                    status === "removed" && tw`line-through text-gray-600`
                                ]}>
                                    {item.title}
                                </Text>
                                {status === "added" && (
                                    <MaterialCommunityIcons 
                                        name="check-circle-outline" 
                                        size={20} 
                                        style={tw`text-gray-600`} 
                                    />
                                )}
                            </View>

                            {status === "idle" && (
                                <View style={tw`flex-row items-center gap-x-1`}>
                                    <Text style={tw`text-gray-500 text-sm`}>
                                        {getActivityDurationLabel(item.estimated_duration)}
                                    </Text>
                                    <Text style={tw`text-gray-500 font-medium`}>•</Text>
                                    <View style={tw`flex-row items-center`}>
                                        <Ionicons name="checkbox" size={16} style={tw`mr-1 text-gray-500`} />
                                        <Text style={tw`text-gray-500 font-medium`}>
                                            {item.subtasks?.length || 0}
                                        </Text>
                                    </View>
                                </View>
                            )}
                        </View>
                    </View>
                </Animated.View>
            </TouchableWithoutFeedback>

            <Animated.View style={[tw`overflow-hidden`, optionsStyle]}>
                <View style={tw`flex-row justify-between p-2 bg-purple-200 rounded-b-xl`}>
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
                </View>
            </Animated.View>
        </View>
    );
};
