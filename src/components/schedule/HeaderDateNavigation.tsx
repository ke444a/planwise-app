import { TouchableOpacity, View, Text, Modal } from "react-native";
import tw from "twrnc";
import Entypo from "@expo/vector-icons/Entypo";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import DateTimePicker, { useDefaultStyles } from "react-native-ui-datepicker";
import { useState } from "react";

interface DateNavigationProps {
    currentDate: Date;
    setCurrentDate: (_newDate: Date) => void;
}

const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
        day: "numeric",
        month: "long",
        year: "numeric"
    });
};

const HeaderDateNavigation = ({ 
    currentDate, 
    setCurrentDate 
}: DateNavigationProps) => {    
    const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
    const defaultStyles = useDefaultStyles();
    
    const goToPreviousDay = () => {
        const newDate = new Date(currentDate);
        newDate.setDate(newDate.getDate() - 1);
        setCurrentDate(newDate);
    };
    
    const goToNextDay = () => {
        const newDate = new Date(currentDate);
        newDate.setDate(newDate.getDate() + 1);
        setCurrentDate(newDate);
    };

    return (
        <View style={tw`flex-row items-center justify-between px-4 py-6`}>
            <TouchableOpacity onPress={goToPreviousDay}>
                <Entypo name="chevron-left" size={28} color="#333" />
            </TouchableOpacity>
        
            <TouchableOpacity 
                onPress={() => setIsDatePickerVisible(true)}
                style={tw`flex-row items-center`}
            >
                <MaterialCommunityIcons name="calendar" size={24} style={tw`text-gray-600 mr-2 dark:text-gray-950`} />
                <Text style={tw`text-xl font-bold text-gray-800 dark:text-gray-950`}>
                    {formatDate(currentDate)}
                </Text>
            </TouchableOpacity>
        
            <TouchableOpacity onPress={goToNextDay}>
                <Entypo name="chevron-right" size={28} color="#333" />
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
                                date={currentDate}
                                onChange={({ date }) => {
                                    setCurrentDate(date as Date);
                                    setIsDatePickerVisible(false);
                                }}
                                timePicker={false}
                                mode="single"
                                styles={{
                                    ...defaultStyles,
                                    selected: tw`bg-purple-500 text-white`,
                                }}
                            />
                        </View>
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
};

export default HeaderDateNavigation;
