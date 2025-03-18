import { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { ButtonWithIcon } from "@/components/ui/ButtonWithIcon";
import tw from "twrnc";
import Feather from "@expo/vector-icons/Feather";
import Ionicons from "@expo/vector-icons/Ionicons";

interface OptionProps {
    title: string;
    description: string;
    icon: React.ReactNode;
    selected: boolean;
    onSelect: () => void;
}

interface DayStructureScreenProps {
    onNextPress: (_structure: string) => void;
}

const Option = ({ title, description, icon, selected, onSelect }: OptionProps) => {
    return (
        <TouchableOpacity 
            style={tw`flex-row items-center p-4 mb-6 border-2 rounded-2xl border-gray-300 bg-white`}
            onPress={onSelect}
        >
            <View style={tw`mr-4`}>
                {icon}
            </View>
            <View style={tw`flex-1`}>
                <Text style={tw`text-lg font-semibold text-gray-950`}>{title}</Text>
                <Text style={tw`text-slate-500`}>{description}</Text>
            </View>
            <View style={tw`ml-2 h-6 w-6 rounded-full border-2 ${selected ? "bg-teal-500 border-teal-500" : "bg-white border-gray-300"} items-center justify-center`}>
                {selected && <View style={tw`h-3 w-3 rounded-full bg-white`} />}
            </View>
        </TouchableOpacity>
    );
};

const DayStructureScreen: React.FC<DayStructureScreenProps> = ({ onNextPress }) => {
    const [selectedOption, setSelectedOption] = useState<"morning" | "mixed" | "night" | null>(null);

    const handleNextPress = () => {
        if (!selectedOption) return;
        onNextPress(selectedOption);
    };

    return (
        <View style={tw`flex-1 justify-between`}>
            <View>
                <Text style={tw`text-4xl font-semibold text-gray-950 mb-3`}>
                        How do You Like to Structure Your Day?
                </Text>
                <Text style={tw`text-lg text-gray-500 font-medium mb-8`}>
                        Do you prefer tackling big tasks first, mixing things up, or easing into your day?
                </Text>

                <Option 
                    title="Early Bird"
                    description="Get big tasks done first"
                    icon={<Feather name="sunrise" size={28} style={tw`text-gray-950`} />}
                    selected={selectedOption === "morning"}
                    onSelect={() => setSelectedOption("morning")}
                />

                <Option 
                    title="Paced planner"
                    description="Mix it up throughout the day"
                    icon={<Feather name="clock" size={28} style={tw`text-gray-950`} />}
                    selected={selectedOption === "mixed"}
                    onSelect={() => setSelectedOption("mixed")}
                />

                <Option 
                    title="Night owl"
                    description="Ease into the day, then power through"
                    icon={<Feather name="sunset" size={28} style={tw`text-gray-950`} />}
                    selected={selectedOption === "night"}
                    onSelect={() => setSelectedOption("night")}
                />
            </View>
                
            <View style={tw`mt-4`}>
                <ButtonWithIcon
                    label="Next"
                    onPress={handleNextPress}
                    iconPosition="right"
                    fullWidth
                    icon={<Ionicons name="arrow-forward" size={24} style={tw`text-gray-950`} />}
                    disabled={selectedOption === null}
                />
            </View>
        </View>
    );
};

export default DayStructureScreen;