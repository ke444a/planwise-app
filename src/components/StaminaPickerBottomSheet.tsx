import { useState, useEffect } from "react";
import { View, Text, Modal, TouchableOpacity } from "react-native";
import tw from "twrnc";
import AntDesign from "@expo/vector-icons/AntDesign";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

interface StaminaPickerBottomSheetProps {
    visible: boolean;
    onClose: () => void;
    initialValue: number;
    onValueSelected: (_value: number) => void;
    minValue?: number;
    maxValue?: number;
}

const StaminaPickerBottomSheet = ({ 
    visible, 
    onClose, 
    initialValue,
    onValueSelected,
    minValue = 10,
    maxValue = 50
}: StaminaPickerBottomSheetProps) => {
    const [value, setValue] = useState(initialValue);

    useEffect(() => {
        if (visible) {
            setValue(initialValue);
        }
    }, [visible, initialValue]);

    const handleDecrease = () => {
        if (value > minValue) {
            setValue(value - 1);
        }
    };

    const handleIncrease = () => {
        if (value < maxValue) {
            setValue(value + 1);
        }
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
                                <MaterialCommunityIcons 
                                    name="lightning-bolt" 
                                    size={24} 
                                    style={tw`text-gray-600`} 
                                />
                                <View>
                                    <Text style={tw`text-2xl font-semibold ml-2`}>Stamina</Text>
                                    <Text style={tw`text-gray-500 text-sm ml-2`}>
                                        Select how much stamina you have per day
                                    </Text>
                                </View>
                            </View>
                            <TouchableOpacity onPress={onClose}>
                                <AntDesign name="closecircle" size={20} style={tw`text-gray-500`} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={tw`px-6 py-8`}>
                        <View style={tw`flex-row items-center justify-between rounded-2xl px-6 py-4 bg-purple-100`}>
                            <TouchableOpacity 
                                onPress={handleDecrease}
                                style={[
                                    tw`w-12 h-12 rounded-full bg-white justify-center items-center`,
                                    tw`border border-gray-200`
                                ]}
                            >
                                <AntDesign name="minus" size={24} style={tw`text-gray-600`} />
                            </TouchableOpacity>

                            <View style={tw`flex-row items-center`}>
                                <Text style={tw`text-6xl font-semibold text-gray-900`}>
                                    {value}
                                </Text>
                            </View>

                            <TouchableOpacity 
                                onPress={handleIncrease}
                                style={[
                                    tw`w-12 h-12 rounded-full bg-white justify-center items-center`,
                                    tw`border border-gray-200`
                                ]}
                            >
                                <AntDesign name="plus" size={24} style={tw`text-gray-600`} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <TouchableOpacity 
                        style={tw`mx-6 py-3 bg-gray-600 rounded-xl flex-row justify-center items-center mb-8`}
                        onPress={() => {
                            onValueSelected(value);
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

export default StaminaPickerBottomSheet;