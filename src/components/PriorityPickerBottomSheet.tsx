import { useState, useEffect } from "react";
import { View, Text, Modal, TouchableOpacity, ScrollView } from "react-native";
import tw from "twrnc";
import AntDesign from "@expo/vector-icons/AntDesign";
import Ionicons from "@expo/vector-icons/Ionicons";
import Feather from "@expo/vector-icons/Feather";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

interface PriorityPickerBottomSheetProps {
    visible: boolean;
    onClose: () => void;
    initialValues: ActivityType[];
    onValuesSelected: (_values: ActivityType[]) => void;
}

interface ActivityOptionProps {
    title: string;
    description: string;
    icon: React.ReactNode;
    selected: boolean;
    onToggle: () => void;
}

const ActivityOption = ({ title, description, icon, selected, onToggle }: ActivityOptionProps) => {
    return (
        <TouchableOpacity 
            style={[
                tw`flex-row items-center p-4 mb-3 border-2 rounded-xl bg-white`,
                selected ? tw`border-purple-300` : tw`border-gray-200`
            ]}
            onPress={onToggle}
        >
            <View style={tw`mr-4`}>
                {icon}
            </View>
            <View style={tw`flex-1`}>
                <Text style={tw`text-lg font-semibold text-gray-950`}>{title}</Text>
                <Text style={tw`text-gray-500`}>{description}</Text>
            </View>
            <View style={tw`ml-2 h-6 w-6 rounded-full border-2 ${selected ? "bg-purple-400 border-purple-400" : "bg-white border-gray-300"} items-center justify-center`}>
                {selected && <Feather name="check" size={16} style={tw`text-white`} />}
            </View>
        </TouchableOpacity>
    );
};

const PriorityPickerBottomSheet = ({ 
    visible, 
    onClose, 
    initialValues,
    onValuesSelected 
}: PriorityPickerBottomSheetProps) => {
    const [selectedActivities, setSelectedActivities] = useState<ActivityType[]>(initialValues);

    useEffect(() => {
        if (visible) {
            setSelectedActivities(initialValues);
        }
    }, [visible, initialValues]);

    const toggleActivity = (activityId: ActivityType) => {
        setSelectedActivities(prev => {
            if (prev.includes(activityId)) {
                return prev.filter(id => id !== activityId);
            } else {
                return [...prev, activityId];
            }
        });
    };

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={tw`flex-1 justify-end bg-black/30`}>
                <View style={tw`bg-white rounded-t-3xl max-h-[85%]`}>
                    <View style={tw`px-6 pt-5 mb-4`}>
                        <View style={tw`flex-row justify-between items-center`}>
                            <View style={tw`flex-row items-center`}>
                                <MaterialIcons name="priority-high" size={24} style={tw`text-gray-600`} />
                                <View>
                                    <Text style={tw`text-2xl font-semibold ml-2`}>Priorities</Text>
                                    <Text style={tw`text-gray-500 text-sm ml-2`}>
                                        Choose what matters most in your day
                                    </Text>
                                </View>
                            </View>
                            <TouchableOpacity onPress={onClose}>
                                <AntDesign name="closecircle" size={20} style={tw`text-gray-500`} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <ScrollView 
                        style={tw`px-6 max-h-[500px]`}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={tw`pb-4`}
                    >
                        <ActivityOption 
                            title="Meetings"
                            description="Stay on top of calls and discussions"
                            icon={<Ionicons name="people" size={28} style={tw`text-gray-950`} />}
                            selected={selectedActivities.includes("collaborative_work")}
                            onToggle={() => toggleActivity("collaborative_work")}
                        />

                        <ActivityOption 
                            title="Fitness"
                            description="Make time to move and stay active"
                            icon={<FontAwesome5 name="dumbbell" size={24} style={tw`text-gray-950`} />}
                            selected={selectedActivities.includes("health_fitness")}
                            onToggle={() => toggleActivity("health_fitness")}
                        />

                        <ActivityOption 
                            title="Meals"
                            description="Fuel up with regular meal breaks"
                            icon={<Ionicons name="restaurant-outline" size={28} style={tw`text-gray-950`} />}
                            selected={selectedActivities.includes("food")}
                            onToggle={() => toggleActivity("food")}
                        />

                        <ActivityOption 
                            title="Deep work"
                            description="Focus without distractions"
                            icon={<Feather name="target" size={28} style={tw`text-gray-950`} />}
                            selected={selectedActivities.includes("focus_work")}
                            onToggle={() => toggleActivity("focus_work")}
                        />

                        <ActivityOption 
                            title="Education"
                            description="Prioritize studying and learning"
                            icon={<Ionicons name="school-outline" size={28} style={tw`text-gray-950`} />}
                            selected={selectedActivities.includes("education")}
                            onToggle={() => toggleActivity("education")}
                        />

                        <ActivityOption 
                            title="Recreation"
                            description="Make time for rest and hobbies"
                            icon={<MaterialCommunityIcons name="meditation" size={28} style={tw`text-gray-950`} />}
                            selected={selectedActivities.includes("recreation")}
                            onToggle={() => toggleActivity("recreation")}
                        />
                    </ScrollView>

                    <TouchableOpacity 
                        style={tw`mx-6 py-3 bg-gray-600 rounded-xl flex-row justify-center items-center my-6`}
                        onPress={() => {
                            onValuesSelected(selectedActivities);
                            onClose();
                        }}
                        disabled={selectedActivities.length === 0}
                    >
                        <Text style={tw`text-white font-medium text-lg`}>Save</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

export default PriorityPickerBottomSheet; 