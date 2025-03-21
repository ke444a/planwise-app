import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import tw from "twrnc";
import Feather from "@expo/vector-icons/Feather";
import BottomSheet from "../ui/BottomSheet";

type DayStructure = "morning" | "mixed" | "night";

interface DayStructurePickerBottomSheetProps {
    visible: boolean;
    onClose: () => void;
    initialValue: DayStructure;
    onValueSelected: (_value: DayStructure) => void;
}

interface OptionProps {
    title: string;
    description: string;
    icon: React.ReactNode;
    selected: boolean;
    onSelect: () => void;
}

const Option = ({ title, description, icon, selected, onSelect }: OptionProps) => {
    return (
        <TouchableOpacity
            style={[
                tw`flex-row items-center p-4 mb-3 border-2 rounded-xl bg-white`,
                selected ? tw`border-purple-300` : tw`border-gray-200`
            ]}
            onPress={onSelect}
        >
            <View style={tw`mr-4`}>
                {icon}
            </View>
            <View style={tw`flex-1`}>
                <Text style={tw`text-lg font-semibold text-gray-950`}>{title}</Text>
                <Text style={tw`text-gray-500`}>{description}</Text>
            </View>
            <View style={tw`ml-2 h-6 w-6 rounded-full border-2 ${selected ? "bg-purple-400 border-purple-400" : "bg-white border-gray-300"} items-center justify-center`}>
                {selected && <View style={tw`h-3 w-3 rounded-full bg-white`} />}
            </View>
        </TouchableOpacity>
    );
};

const DayStructurePickerBottomSheet = ({
    visible,
    onClose,
    initialValue,
    onValueSelected
}: DayStructurePickerBottomSheetProps) => {
    const [selectedOption, setSelectedOption] = useState<DayStructure>(initialValue);

    useEffect(() => {
        if (visible) {
            setSelectedOption(initialValue);
        }
    }, [visible, initialValue]);

    const handleOptionSelect = (value: DayStructure) => {
        setSelectedOption(value);
        onValueSelected(value);
        onClose();
    };

    return (
        <BottomSheet visible={visible} onClose={onClose}>
            <Text style={tw`text-gray-600 text-2xl font-semibold px-6 mb-3`}>
                How do you like to structure your day?
            </Text>
            <View style={tw`px-6 py-4`}>
                <Option
                    title="Early Bird"
                    description="Get big tasks done first"
                    icon={<Feather name="sunrise" size={28} style={tw`text-gray-950`} />}
                    selected={selectedOption === "morning"}
                    onSelect={() => handleOptionSelect("morning")}
                />

                <Option
                    title="Paced Planner"
                    description="Mix it up throughout the day"
                    icon={<Feather name="clock" size={28} style={tw`text-gray-950`} />}
                    selected={selectedOption === "mixed"}
                    onSelect={() => handleOptionSelect("mixed")}
                />

                <Option
                    title="Night Owl"
                    description="Ease into the day, then power through"
                    icon={<Feather name="sunset" size={28} style={tw`text-gray-950`} />}
                    selected={selectedOption === "night"}
                    onSelect={() => handleOptionSelect("night")}
                />
            </View>
        </BottomSheet>
    );
};

export default DayStructurePickerBottomSheet;