import { View, Text, TouchableOpacity, TouchableWithoutFeedback } from "react-native";
import tw from "twrnc";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import Animated from "react-native-reanimated";
import { getActivityDurationLabel } from "@/utils/getActivityDurationLabel";
import { useGeneratedItemAnimations } from "@/hooks/useGeneratedItemAnimations";

interface GeneratedBacklogItemProps {
    item: IBacklogItemGenAI;
    status: "idle" | "added" | "removed";
    onAdd: () => void;
    onRemove: () => void;
}

export const GeneratedBacklogItem = ({ 
    item, 
    status,
    onAdd,
    onRemove 
}: GeneratedBacklogItemProps) => {
    const { 
        showOptions,
        handlePressIn,
        handlePressOut,
        handleToggleOptions,
        pressStyle,
        optionsStyle,
        contentStyle,
    } = useGeneratedItemAnimations(status);

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
                        <Animated.View style={[tw`flex-1 ml-2`, contentStyle]}>
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
                        </Animated.View>
                    </View>
                </Animated.View>
            </TouchableWithoutFeedback>

            <Animated.View style={[tw`overflow-hidden`, optionsStyle]}>
                <View style={tw`flex-row justify-between p-2 bg-purple-200 dark:bg-purple-300 rounded-b-xl`}>
                    <TouchableOpacity 
                        onPress={onAdd}
                        style={tw`flex-1 bg-white rounded-lg py-3 mx-1 items-center flex-row justify-center`}
                    >
                        <Ionicons name="add" size={20} style={tw`text-gray-950 mr-1`} />
                        <Text style={tw`text-gray-950 font-medium`}>Add</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        onPress={onRemove}
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
