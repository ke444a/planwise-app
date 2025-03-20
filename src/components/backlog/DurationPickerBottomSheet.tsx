import { useState } from "react";
import { View, Text, Modal, TouchableOpacity } from "react-native";
import tw from "twrnc";
import AntDesign from "@expo/vector-icons/AntDesign";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

interface DurationPickerBottomSheetProps {
    visible: boolean;
    onClose: () => void;
    onDurationSelected: (_minutes: number) => void;
}

const HOURS = Array.from({ length: 8 }, (_, i) => i);
const MINUTES = Array.from({ length: 12 }, (_, i) => i * 5);

export const DurationPickerBottomSheet = ({ 
    visible, 
    onClose, 
    onDurationSelected 
}: DurationPickerBottomSheetProps) => {
    const [selectedHours, setSelectedHours] = useState(1);
    const [selectedMinutes, setSelectedMinutes] = useState(0);

    const handleSave = () => {
        const totalMinutes = (selectedHours * 60) + selectedMinutes;
        onDurationSelected(totalMinutes);
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
                                <MaterialCommunityIcons name="clock-outline" size={24} style={tw`text-gray-600`} />
                                <Text style={tw`text-2xl font-semibold ml-2`}>Custom duration</Text>
                            </View>
                            <TouchableOpacity onPress={onClose}>
                                <AntDesign name="closecircle" size={20} style={tw`text-gray-500`} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={tw`flex-row justify-center items-center px-6 py-8`}>
                        {/* Hours */}
                        <View style={tw`items-center`}>
                            <Text style={tw`text-gray-500 mb-4`}>Hours</Text>
                            <View style={tw`bg-gray-100 rounded-xl p-2`}>
                                {HOURS.map((hour) => (
                                    <TouchableOpacity
                                        key={hour}
                                        style={[
                                            tw`py-2 px-6 rounded-lg`,
                                            selectedHours === hour && tw`bg-purple-100`
                                        ]}
                                        onPress={() => setSelectedHours(hour)}
                                    >
                                        <Text style={[
                                            tw`text-lg font-medium`,
                                            selectedHours === hour ? tw`text-purple-500` : tw`text-gray-600`
                                        ]}>
                                            {hour}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Minutes */}
                        <View style={tw`items-center ml-6`}>
                            <Text style={tw`text-gray-500 mb-4`}>Minutes</Text>
                            <View style={tw`bg-gray-100 rounded-xl p-2`}>
                                {MINUTES.map((minute) => (
                                    <TouchableOpacity
                                        key={minute}
                                        style={[
                                            tw`py-2 px-6 rounded-lg`,
                                            selectedMinutes === minute && tw`bg-purple-100`
                                        ]}
                                        onPress={() => setSelectedMinutes(minute)}
                                    >
                                        <Text style={[
                                            tw`text-lg font-medium`,
                                            selectedMinutes === minute ? tw`text-purple-500` : tw`text-gray-600`
                                        ]}>
                                            {minute.toString().padStart(2, "0")}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    </View>

                    <TouchableOpacity 
                        style={tw`mx-6 py-3 bg-gray-600 rounded-xl flex-row justify-center items-center mb-8`}
                        onPress={handleSave}
                    >
                        <Text style={tw`text-white font-medium text-lg`}>Save</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}; 