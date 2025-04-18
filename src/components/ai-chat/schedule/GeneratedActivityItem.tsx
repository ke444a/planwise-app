import { View, Text, TouchableOpacity, TouchableWithoutFeedback } from "react-native";
import tw from "twrnc";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { getActivityDurationLabel } from "@/utils/getActivityDurationLabel";
import Animated from "react-native-reanimated";
import ActivityIcon from "@/components/activity/ActivityIcon";
import { getPriorityLabel } from "@/utils/getPriorityLabel";
import { useGeneratedItemAnimations } from "@/hooks/useGeneratedItemAnimations";

interface ActivityItemProps {
    activity: IActivityGenAI;
    status: "idle" | "added" | "removed" | "backlog";
    onAddToSchedule: () => void;
    onRemove: () => void;
    onAddToBacklog: () => void;
    testID?: string;
}

export const GeneratedActivityItem = ({ 
    activity, 
    status, 
    onAddToSchedule, 
    onRemove, 
    onAddToBacklog,
    testID
}: ActivityItemProps) => {
    const { 
        showOptions,
        handlePressIn,
        handlePressOut,
        handleToggleOptions,
        pressStyle,
        optionsStyle,
        contentStyle,
    } = useGeneratedItemAnimations(status);

    const hasWarnings = Array.isArray(activity?.warnings) && activity.warnings.length > 0;
    const firstWarning = hasWarnings && Array.isArray(activity.warnings) ? activity.warnings[0] : null;

    return (
        <View testID={testID}>
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
                        <Animated.View style={contentStyle}>
                            <ActivityIcon 
                                activityType={activity.type} 
                                activityPriority={activity.priority} 
                                iconSize={32} 
                            />
                        </Animated.View>

                        {/* Content */}
                        <Animated.View style={[tw`flex-1 ml-4`, contentStyle]}>
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
                                    <View style={tw`flex-row flex-wrap gap-3 items-center mb-1`}>
                                        <View style={tw`flex-row items-center`}>
                                            <Text style={tw`text-gray-500 font-medium mr-1 text-sm`}>{activity.staminaCost}</Text>
                                            <Ionicons name="flash" size={14} style={tw`text-gray-500`} />
                                        </View>
                                        {activity.priority !== "routine" && (
                                            <View>
                                                <Text style={tw`font-medium text-gray-500 text-sm`}>
                                                    {getPriorityLabel(activity.priority)}
                                                </Text>
                                            </View>
                                        )}
                                    </View>

                                    {/* Warning message if exists */}
                                    {firstWarning && (
                                        <View style={tw`flex-row items-center bg-orange-50 rounded-lg p-1`}>
                                            <Ionicons name="warning" size={16} style={tw`text-orange-500 mr-1`} />
                                            <Text style={tw`text-orange-500 text-sm flex-1`}>
                                                {firstWarning}
                                            </Text>
                                        </View>
                                    )}
                                </>
                            )}
                        </Animated.View>
                    </View>
                </Animated.View>
            </TouchableWithoutFeedback>

            <Animated.View style={[tw`overflow-hidden`, optionsStyle]}>
                <View style={tw`flex-row justify-between p-2 bg-purple-200 dark:bg-purple-300 rounded-b-xl`}>
                    <TouchableOpacity 
                        onPress={onAddToSchedule}
                        disabled={hasWarnings}
                        style={[
                            tw`flex-1 bg-white rounded-lg py-3 mx-1 items-center flex-row justify-center`,
                            hasWarnings && tw`opacity-50`
                        ]}
                        testID={`generated-activity-item-add-${testID}`}
                    >
                        <Ionicons name="add" size={20} style={tw`text-gray-950 mr-1`} />
                        <Text style={tw`text-gray-950 font-medium`}>Add</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        onPress={onRemove}
                        style={tw`flex-1 bg-white rounded-lg py-3 mx-1 items-center flex-row justify-center`}
                        testID={`generated-activity-item-remove-${testID}`}
                    >
                        <Ionicons name="close" size={20} style={tw`text-gray-950 mr-1`} />
                        <Text style={tw`text-gray-950 font-medium`}>Remove</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        onPress={onAddToBacklog}
                        disabled={status === "backlog"}
                        style={[
                            tw`flex-1 bg-white rounded-lg py-3 mx-1 items-center flex-row justify-center`,
                            status === "backlog" && tw`opacity-50`
                        ]}
                        testID={`generated-activity-item-backlog-${testID}`}
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