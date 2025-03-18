import { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { ButtonWithIcon } from "@/components/ui/ButtonWithIcon";
import tw from "twrnc";
import Ionicons from "@expo/vector-icons/Ionicons";
import Feather from "@expo/vector-icons/Feather";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

interface ActivityOptionProps {
    title: string;
    description: string;
    icon: React.ReactNode;
    selected: boolean;
    onToggle: () => void;
}

interface PriorityActivityScreenProps {
    onNextPress: (_activities: string[]) => void;
}

const ActivityOption = ({ title, description, icon, selected, onToggle }: ActivityOptionProps) => {
    return (
        <TouchableOpacity 
            style={tw`flex-row items-center p-4 mb-4 border-2 rounded-2xl border-gray-300 bg-white`}
            onPress={onToggle}
        >
            <View style={tw`mr-4`}>
                {icon}
            </View>
            <View style={tw`flex-1`}>
                <Text style={tw`text-lg text-gray-950`}>{title}</Text>
                <Text style={tw`text-slate-500`}>{description}</Text>
            </View>
            <View style={tw`ml-2 h-6 w-6 rounded-full border-2 ${selected ? "bg-teal-500 border-teal-500" : "bg-white border-gray-300"} items-center justify-center`}>
                {selected && <Feather name="check" size={16} style={tw`text-white`} />}
            </View>
        </TouchableOpacity>
    );
};

const PriorityActivityScreen: React.FC<PriorityActivityScreenProps> = ({ onNextPress }) => {
    const [selectedActivities, setSelectedActivities] = useState<string[]>([]);

    const toggleActivity = (activityId: string) => {
        setSelectedActivities(prev => {
            if (prev.includes(activityId)) {
                return prev.filter(id => id !== activityId);
            } else {
                return [...prev, activityId];
            }
        });
    };

    const handleNextPress = () => {
        onNextPress(selectedActivities);
    };

    return (
        <View style={tw`flex-1 justify-between`}>
            <View style={tw`flex-1`}>
                <Text style={tw`text-4xl font-semibold text-gray-950 mb-3`}>
                        What is Most Important in Your Day?
                </Text>
                <Text style={tw`text-lg text-gray-500 font-medium mb-6`}>
                        Pick the things you want to prioritize - work, health, learning, or personal time.
                </Text>
                <ScrollView 
                    showsVerticalScrollIndicator={false}
                    style={tw`flex-1`}
                    contentContainerStyle={tw`pb-4`}
                >
                    <ActivityOption 
                        title="Meetings"
                        description="Stay on top of calls and discussions"
                        icon={<Ionicons name="people" size={28} style={tw`text-gray-950`} />}
                        selected={selectedActivities.includes("meetings")}
                        onToggle={() => toggleActivity("meetings")}
                    />

                    <ActivityOption 
                        title="Fitness"
                        description="Make time to move and stay active"
                        icon={<FontAwesome5 name="dumbbell" size={24} style={tw`text-gray-950`} />}
                        selected={selectedActivities.includes("fitness")}
                        onToggle={() => toggleActivity("fitness")}
                    />

                    <ActivityOption 
                        title="Meals"
                        description="Fuel up with regular meal breaks"
                        icon={<Ionicons name="restaurant-outline" size={28} style={tw`text-gray-950`} />}
                        selected={selectedActivities.includes("meals")}
                        onToggle={() => toggleActivity("meals")}
                    />

                    <ActivityOption 
                        title="Deep work"
                        description="Focus without distractions"
                        icon={<Feather name="target" size={28} style={tw`text-gray-950`} />}
                        selected={selectedActivities.includes("deep_work")}
                        onToggle={() => toggleActivity("deep_work")}
                    />

                    <ActivityOption 
                        title="University"
                        description="Prioritize studying and learning"
                        icon={<Ionicons name="school-outline" size={28} style={tw`text-gray-950`} />}
                        selected={selectedActivities.includes("university")}
                        onToggle={() => toggleActivity("university")}
                    />

                    <ActivityOption 
                        title="Collaborative work"
                        description="Time for teamwork and cooperation"
                        icon={<Ionicons name="people-outline" size={28} style={tw`text-gray-950`} />}
                        selected={selectedActivities.includes("collaborative_work")}
                        onToggle={() => toggleActivity("collaborative_work")}
                    />

                    <ActivityOption 
                        title="Recreation"
                        description="Make time for rest and hobbies"
                        icon={<MaterialCommunityIcons name="meditation" size={28} style={tw`text-gray-950`} />}
                        selected={selectedActivities.includes("recreation")}
                        onToggle={() => toggleActivity("recreation")}
                    />

                    <ActivityOption 
                        title="Miscellaneous"
                        description="Other important activities"
                        icon={<Feather name="more-horizontal" size={28} style={tw`text-gray-950`} />}
                        selected={selectedActivities.includes("miscellaneous")}
                        onToggle={() => toggleActivity("miscellaneous")}
                    />
                </ScrollView>
            </View>
                
            <View style={tw`mt-4`}>
                <ButtonWithIcon
                    label="Next"
                    onPress={handleNextPress}
                    iconPosition="right"
                    fullWidth
                    icon={<Ionicons name="arrow-forward" size={24} style={tw`text-gray-950`} />}
                    disabled={selectedActivities.length === 0}
                />
            </View>
        </View>
    );
};

export default PriorityActivityScreen;
