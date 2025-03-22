import { Ionicons, MaterialCommunityIcons, FontAwesome6, FontAwesome5 } from "@expo/vector-icons";
import tw from "twrnc";

interface ActivityIconProps {
    activityType: ActivityType;
    activityPriority: ActivityPriority;
    iconSize?: number;
    color?: string;
}

const ActivityIcon = ({ activityType, activityPriority, iconSize = 32, color }: ActivityIconProps) => {
    const iconColor: Record<ActivityPriority, string> = {
        "must_do": "text-rose-400",
        "get_it_done": "text-orange-400",
        "nice_to_have": "text-blue-500",
        "routine": "text-blue-500",
    };
    const clr = color || iconColor[activityPriority];

    const iconComponent: Record<ActivityType, React.ReactNode> = {
        "focus_work": <FontAwesome5 name="brain" size={iconSize} style={tw`${clr}`} />,
        "collaborative_work": <Ionicons name="people" size={iconSize} style={tw`${clr}`} />,
        "repetitive_tasks": <FontAwesome6 name="repeat" size={iconSize} style={tw`${clr}`} />,
        "health_fitness": <MaterialCommunityIcons name="weight-lifter" size={iconSize} style={tw`${clr}`} />,
        "food": <FontAwesome5 name="utensils" size={iconSize} style={tw`${clr}`} />,
        "recreation": <MaterialCommunityIcons name="meditation" size={iconSize} style={tw`${clr}`} />,
        "education": <FontAwesome5 name="book" size={iconSize} style={tw`${clr}`} />,
        "life_maintenance": <FontAwesome6 name="screwdriver-wrench" size={iconSize} style={tw`${clr}`} />,
        "misc": <MaterialCommunityIcons name="help" size={iconSize} style={tw`${clr}`} />,
    };

    return iconComponent[activityType];
}; 

export default ActivityIcon;
