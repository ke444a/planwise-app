import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import tw from "twrnc";
import AntDesign from "@expo/vector-icons/AntDesign";
import BottomSheet from "../ui/BottomSheet";

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

    const handleClose = () => {
        onValueSelected(value);
        onClose();
    };

    return (
        <BottomSheet visible={visible} onClose={handleClose}>
            <Text style={tw`text-gray-600 text-2xl font-semibold px-6 mb-3`}>
                How much stamina do you have per day?
            </Text>
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
        </BottomSheet>
    );
};

export default StaminaPickerBottomSheet;