import { View, Text, TouchableOpacity, Modal } from "react-native";
import tw from "twrnc";
import DateTimePicker, { useDefaultStyles } from "react-native-ui-datepicker";
import { useState } from "react";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

interface DatePickerSectionProps {
    selectedDate: Date;
    onDateChange: (_date: Date) => void;
}

export const DatePickerSection = ({ selectedDate, onDateChange }: DatePickerSectionProps) => {
    const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
    const defaultStyles = useDefaultStyles();

    const formatDate = (date: Date) => {
        return date.toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
        });
    };

    return (
        <View style={tw`mb-8`}>
            <TouchableOpacity 
                onPress={() => setIsDatePickerVisible(true)}
                style={tw`flex-row items-center justify-center`}
            >
                <MaterialCommunityIcons name="calendar" size={24} style={tw`text-purple-500 mr-3`} />
                <Text style={tw`text-purple-500 text-lg`}>{formatDate(selectedDate)}</Text>
            </TouchableOpacity>

            <Modal
                visible={isDatePickerVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setIsDatePickerVisible(false)}
            >
                <TouchableOpacity 
                    style={tw`flex-1 bg-black bg-opacity-50`} 
                    activeOpacity={1} 
                    onPress={() => setIsDatePickerVisible(false)}
                >
                    <View style={tw`flex-1 justify-end`}>
                        <View style={tw`bg-white rounded-t-3xl p-4`}>
                            <View style={tw`flex-row justify-between items-center mb-4`}>
                                <Text style={tw`text-xl font-semibold text-gray-950`}>Select Date</Text>
                                <TouchableOpacity onPress={() => setIsDatePickerVisible(false)}>
                                    <MaterialCommunityIcons name="close" size={24} style={tw`text-gray-500`} />
                                </TouchableOpacity>
                            </View>
                            <DateTimePicker
                                date={selectedDate}
                                onChange={({ date }) => {
                                    onDateChange(date as Date);
                                    setIsDatePickerVisible(false);
                                }}
                                timePicker={false}
                                mode="single"
                                styles={{
                                    ...defaultStyles,
                                    selected: tw`bg-purple-500 text-white`,
                                }}
                                // selectedItemColor="#a855f7"
                                // calendarTextStyle={tw`text-gray-950`}
                                // headerTextStyle={tw`text-gray-950`}
                                // weekDaysTextStyle={tw`text-gray-500`}
                            />
                        </View>
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
}; 