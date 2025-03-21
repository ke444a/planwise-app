import { useState, useEffect } from "react";
import { View, Text, Modal, TouchableOpacity } from "react-native";
import tw from "twrnc";
import AntDesign from "@expo/vector-icons/AntDesign";
import Feather from "@expo/vector-icons/Feather";

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
                                <Feather name="clock" size={24} style={tw`text-gray-600`} />
                                <View>
                                    <Text style={tw`text-2xl font-semibold ml-2`}>Day Structure</Text>
                                    <Text style={tw`text-gray-500 text-sm ml-2`}>
                                        Choose how you like to structure your day
                                    </Text>
                                </View>
                            </View>
                            <TouchableOpacity onPress={onClose}>
                                <AntDesign name="closecircle" size={20} style={tw`text-gray-500`} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={tw`px-6 py-4`}>
                        <Option 
                            title="Early Bird"
                            description="Get big tasks done first"
                            icon={<Feather name="sunrise" size={28} style={tw`text-gray-950`} />}
                            selected={selectedOption === "morning"}
                            onSelect={() => setSelectedOption("morning")}
                        />

                        <Option 
                            title="Paced Planner"
                            description="Mix it up throughout the day"
                            icon={<Feather name="clock" size={28} style={tw`text-gray-950`} />}
                            selected={selectedOption === "mixed"}
                            onSelect={() => setSelectedOption("mixed")}
                        />

                        <Option 
                            title="Night Owl"
                            description="Ease into the day, then power through"
                            icon={<Feather name="sunset" size={28} style={tw`text-gray-950`} />}
                            selected={selectedOption === "night"}
                            onSelect={() => setSelectedOption("night")}
                        />
                    </View>

                    <TouchableOpacity 
                        style={tw`mx-6 py-3 bg-gray-600 rounded-xl flex-row justify-center items-center mb-8`}
                        onPress={() => {
                            onValueSelected(selectedOption);
                            onClose();
                        }}
                    >
                        <Text style={tw`text-white font-medium text-lg`}>Save</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

export default DayStructurePickerBottomSheet; 