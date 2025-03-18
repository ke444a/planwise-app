import { View, Text } from "react-native";
import tw from "twrnc";
import { Ionicons, MaterialCommunityIcons, FontAwesome6, FontAwesome5 } from "@expo/vector-icons";
import { timeToMinutes } from "@/utils/timeToMinutes";
import { getTimeRemainingText } from "@/utils/getTimeRemainingText";
import { getActivityDurationLabel } from "@/utils/getActivityDurationLabel";

const getIconComponent = (activityType: ActivityType, activityPriority: ActivityPriority, iconSize: number = 32) => {
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
    }
};

const getActivityCheckmarkColor = (isCompleted: boolean, priority: ActivityPriority) => {
    switch (priority) {
    case "must_do":
        return isCompleted ? "bg-rose-400 border-rose-400" : "border-rose-400";
    case "get_it_done":
        return isCompleted ? "bg-orange-400 border-orange-400" : "border-orange-400";
    case "nice_to_have":
    case "routine":
        return isCompleted ? "bg-blue-500 border-blue-500" : "border-blue-500";
    }
};

const getIsCurrentActivity = (startTime: string, endTime: string): boolean => {
    const now = new Date();
    const currentHours = now.getHours();
    const currentMinutes = now.getMinutes();
    const currentTotalMinutes = currentHours * 60 + currentMinutes;
    
    const startTotalMinutes = timeToMinutes(startTime);
    const endTotalMinutes = timeToMinutes(endTime);
    return currentTotalMinutes >= startTotalMinutes && currentTotalMinutes < endTotalMinutes;
};

interface ActivityCardProps {
    activity: IActivity;
    activityHeight: number;
}

const ActivityCard = ({ activity, activityHeight }: ActivityCardProps) => {
    const isCurrentActivity = getIsCurrentActivity(activity.startTime, activity.endTime);
    const checkmarkColor = getActivityCheckmarkColor(activity.isCompleted, activity.priority);
    const iconHeight = activity.duration <= 30 ? 52 : activityHeight;
    
    return (
        <View style={[tw`flex flex-row items-center w-full pr-4`, { height: activityHeight }]}>
            <View 
                style={[
                    tw`w-[50px] rounded-full bg-slate-200 flex items-center justify-center`,
                    { height: iconHeight }
                ]}
            >
                {getIconComponent(activity.type, activity.priority)}
            </View>
            <View style={tw`ml-3 flex-1`}>
                {isCurrentActivity ? (
                    <Text style={tw`text-gray-500 text-sm mb-1`}>
                        {getTimeRemainingText(activity.endTime)}
                    </Text>
                ) : (
                    <Text style={tw`text-gray-500 text-sm mb-1`}>
                        {activity.startTime}-{activity.endTime} ({getActivityDurationLabel(activity.duration)})
                    </Text>
                )}
                
                <Text 
                    style={[
                        tw`text-gray-950 font-semibold text-lg mb-1`,
                        activity.isCompleted && tw`line-through opacity-70`
                    ]}
                >
                    {activity.title}
                </Text>
                
                {/* Bottom row with stamina, priority, and subtasks */}
                <View style={tw`flex-row flex-wrap gap-2 max-w-[200px] items-center`}>
                    <View style={tw`flex-row items-center rounded-full p-1 border border-gray-500`}>
                        <Text style={tw`text-gray-500 font-medium mr-1`}>{activity.staminaCost}</Text>
                        <Ionicons name="flash" size={16} style={tw`text-gray-500`} />
                    </View>
                    {activity.priority !== "routine" && (
                        <View style={tw`rounded-full p-1 border border-gray-500`}>
                            <Text style={tw`font-medium text-gray-500`}>{getPriorityLabel(activity.priority)}</Text>
                        </View>
                    )}
                    {activity.subtasks && activity.subtasks.length > 0 && (
                        <View style={tw`flex-row items-center border border-gray-500 rounded-full p-1`}>
                            <Text style={tw`text-gray-500 font-medium`}>
                                {activity.subtasks.filter(task => task.isCompleted).length}/{activity.subtasks.length}
                            </Text>
                            <Ionicons name="checkbox" size={16} style={tw`ml-1 text-gray-500`} />
                        </View>
                    )}
                </View>
            </View>
            
            {/* Completion checkmark on the right */}
            <View>
                <View 
                    style={[
                        tw`w-[30px] h-[30px] rounded-full items-center justify-center border-2`,
                        tw`${checkmarkColor}`
                    ]}
                >
                    {activity.isCompleted && (
                        <Ionicons name="checkmark" size={24} color="white" />
                    )}
                </View>
            </View>
        </View>
    );
};

export default ActivityCard;