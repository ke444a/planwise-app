import { View, Text, TouchableOpacity } from "react-native";
import tw from "twrnc";
import { Ionicons } from "@expo/vector-icons";
import { ActivityItem } from "./GeneratedActivityItem";

interface Props {
    activities: IActivity[];
    date: Date;
    onSaveAll?: () => void;
}

const ModelActivityBox = ({ activities, date, onSaveAll }: Props) => {
    const totalStamina = activities.reduce((acc, activity) => acc + activity.staminaCost, 0);
    const totalTasks = activities.length;

    return (
        <View style={tw`py-4 mb-6`}>
            {/* Header with stats */}
            <View style={tw`flex-row justify-between items-start mb-4`}>
                <View style={tw`flex-col gap-y-2`}>
                    <View style={tw`flex-row items-center`}>
                        <Ionicons name="checkbox" size={20} style={tw`mr-1 text-gray-950`} />
                        <Text style={tw`text-gray-950 font-medium`}>0/{totalTasks} tasks added</Text>
                    </View>
                    <View style={tw`flex-row items-center`}>
                        <Ionicons name="flash" size={20} style={tw.style("mr-1 text-gray-950", totalStamina > 20 && "text-orange-400", totalStamina > 25 && "text-red-400")} />
                        <Text style={
                            tw.style(
                                "font-medium text-gray-950", 
                                totalStamina > 20 && "text-orange-400 underline",
                                totalStamina > 25 && "text-red-400 underline"
                            )
                        }>{totalStamina}/25 stamina used</Text>
                    </View>
                </View>
                <TouchableOpacity 
                    onPress={onSaveAll}
                    style={tw`flex-row items-center`}
                >
                    <Ionicons name="checkmark-done" size={20} style={tw`text-rose-500 mr-1`} />
                    <Text style={tw`text-rose-500 font-medium`}>Save All</Text>
                </TouchableOpacity>
            </View>
            <View style={tw`gap-4`}>
                {activities.map((activity, index) => (
                    <ActivityItem 
                        key={activity.id || index}
                        activity={activity}
                        date={date}
                    />
                ))}
            </View>
        </View>
    );
};

export default ModelActivityBox;