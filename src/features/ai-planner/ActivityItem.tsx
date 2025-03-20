import React, { useState } from "react";
import { View, Text, TouchableOpacity, TouchableWithoutFeedback } from "react-native";
import tw from "twrnc";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { getActivityDurationLabel } from "@/utils/getActivityDurationLabel";
import Animated, { 
    useAnimatedStyle, 
    withTiming, 
    useSharedValue,
    interpolate,
    Easing,
    withSpring
} from "react-native-reanimated";
import { useAddItemToBacklogMutation } from "@/api/backlog/addItemToBacklog";
import { useUserStore } from "@/config/userStore";
import ActivityIcon from "@/components/ui/ActivityIcon";
import { useAddActivityToScheduleMutation } from "@/api/schedules/addActivityToSchedule";


const getPriorityLabel = (priority: ActivityPriority) => {
    switch (priority) {
    case "must_do":
        return "🔥 Must Do";
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
    date: Date;
}

export const ActivityItem = ({ activity, date }: ActivityItemProps) => {
    const { user } = useUserStore();
    const [showOptions, setShowOptions] = useState(false);
    const [status, setStatus] = useState<"idle" | "added" | "removed" | "backlog">("idle");
    const { mutate: addItemToBacklog } = useAddItemToBacklogMutation();
    const { mutate: addActivityToSchedule } = useAddActivityToScheduleMutation();
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

        addActivityToSchedule({
            activity: activity,
            date: date,
            uid: user.uid
        }, {
            onSuccess: () => {
                setStatus("added");
                setShowOptions(false);
                animation.value = withTiming(0, {
                    duration: 200,
                    easing: Easing.bezier(0.4, 0, 0.2, 1),
                });
            },
            onError: (error) => {
                console.error(error);
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
    };

    const handleBacklog = () => {
        if (!user?.uid) return;

        // eslint-disable-next-line no-unused-vars
        const { id, ...rest } = activity;
        addItemToBacklog({
            item: {
                ...rest,
                itemType: "activity"
            },
            uid: user.uid
        }, {
            onSuccess: () => {
                setStatus("backlog");
                setShowOptions(false);
                animation.value = withTiming(0, {
                    duration: 200,
                    easing: Easing.bezier(0.4, 0, 0.2, 1),
                });
            },
            onError: (error) => {
                console.error(error);
            }
        });
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
                        (status !== "idle") && tw`bg-slate-100`
                    ]}>
                        <ActivityIcon 
                            activityType={activity.type} 
                            activityPriority={activity.priority} 
                            iconSize={32} 
                        />

                        {/* Content */}
                        <View style={tw`flex-1 ml-4`}>
                            <View style={tw`flex-row items-center justify-between`}>
                                <Text style={[
                                    tw`text-gray-950 font-semibold text-base mb-1`,
                                    status === "removed" && tw`line-through text-gray-600`,
                                    status === "backlog" && tw`text-gray-600`
                                ]}>
                                    {activity.title}
                                </Text>
                                {status === "backlog" && (
                                    <MaterialCommunityIcons 
                                        name="clock-check-outline" 
                                        size={20} 
                                        style={tw`text-gray-600`} 
                                    />
                                )}
                                {status === "added" && (
                                    <MaterialCommunityIcons 
                                        name="check-circle-outline" 
                                        size={20} 
                                        style={tw`text-gray-600`} 
                                    />
                                )}
                            </View>

                            {status === "idle" && (
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
                        disabled={status === "backlog"}
                        style={[
                            tw`flex-1 bg-white rounded-lg py-3 mx-1 items-center flex-row justify-center`,
                            status === "backlog" && tw`opacity-50`
                        ]}
                    >
                        <MaterialCommunityIcons 
                            name="clock-outline"
                            size={20} 
                            style={tw`text-gray-950 mr-1`} 
                        />
                        <Text style={tw`text-gray-950 font-medium`}>
                            Backlog
                        </Text>
                    </TouchableOpacity>
                </View>
            </Animated.View>
        </View>
    );
};