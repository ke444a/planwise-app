import { useRef, useState, useEffect } from "react";
import { View, Text, FlatList, Modal, TouchableOpacity } from "react-native";
import tw from "twrnc";
import Feather from "@expo/vector-icons/Feather";
import AntDesign from "@expo/vector-icons/AntDesign";

interface TimePickerBottomSheetProps {
    visible: boolean;
    onClose: () => void;
    title: string;
    initialTime: string;
    mode: "morning" | "evening";
    onTimeSelected: (_time: string) => void;
}

const ITEM_HEIGHT = 60;
const VISIBLE_ITEMS = 5;
const PICKER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;
const PICKER_PADDING = PICKER_HEIGHT / 2 - ITEM_HEIGHT / 2;

const MORNING_TIME_SLOTS = [
    "4:00", "4:15", "4:30", "4:45", "5:00", "5:15", "5:30", "5:45", "6:00", "6:15", "6:30", "6:45", 
    "7:00", "7:15", "7:30", "7:45", "8:00", "8:15", "8:30", "8:45", "9:00", "9:15", "9:30", "9:45", 
    "10:00", "10:15", "10:30", "10:45", "11:00"
];

const EVENING_TIME_SLOTS = [
    "19:00", "19:15", "19:30", "19:45", "20:00", "20:15", "20:30", "20:45", "21:00", "21:15", "21:30", 
    "21:45", "22:00", "22:15", "22:30", "22:45", "23:00", "23:15", "23:30", "23:45"
];

const TimePickerBottomSheet = ({ 
    visible, 
    onClose, 
    title, 
    initialTime, 
    mode,
    onTimeSelected 
}: TimePickerBottomSheetProps) => {
    const timeSlots = mode === "morning" ? MORNING_TIME_SLOTS : EVENING_TIME_SLOTS;
    const [selectedTime, setSelectedTime] = useState(initialTime);
    const flatListRef = useRef<FlatList>(null);
    const initialIndex = timeSlots.indexOf(initialTime);

    // Center the selected item when component mounts
    useEffect(() => {
        if (visible) {
            setTimeout(() => {
                flatListRef.current?.scrollToOffset({
                    offset: initialIndex * ITEM_HEIGHT,
                    animated: false
                });
            }, 100);
        }
    }, [initialIndex, visible]);

    const getItemLayout = (_: any, index: number) => ({
        length: ITEM_HEIGHT,
        offset: ITEM_HEIGHT * index,
        index,
    });

    const renderItem = ({ item, index }: { item: string; index: number }) => {
        const isSelected = item === selectedTime;
        const selectedIndex = timeSlots.indexOf(selectedTime);
        const relativePosition = Math.abs(index - selectedIndex);
        
        // Calculate opacity based on distance from center
        let opacity = 1;
        if (relativePosition >= 2) opacity = 0.3;
        
        return (
            <View style={tw`h-[${ITEM_HEIGHT}px] justify-center items-center`}>
                <View style={tw`flex-row items-center px-16 py-3`}>
                    <Text style={[
                        tw`text-xl text-gray-950`,
                        isSelected && tw`text-2xl font-semibold`,
                        !isSelected && tw`font-normal`,
                        { opacity }
                    ]}>
                        {item.length === 5 ? item : `0${item}`}
                    </Text>
                </View>
            </View>
        );
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
                                {mode === "morning" ? (
                                    <Feather name="sun" size={24} style={tw`text-gray-600`} />
                                ) : (
                                    <Feather name="moon" size={24} style={tw`text-gray-600`} />
                                )}
                                <Text style={tw`text-2xl font-semibold ml-2`}>{title}</Text>
                            </View>
                            <TouchableOpacity onPress={onClose}>
                                <AntDesign name="closecircle" size={20} style={tw`text-gray-500`} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={tw`h-[${PICKER_HEIGHT}px] relative mb-4`}>
                        <View style={[
                            tw`absolute left-0 right-0 h-[${ITEM_HEIGHT}px]`,
                            { top: PICKER_HEIGHT / 2 - ITEM_HEIGHT / 2, zIndex: 1 }
                        ]}>
                            <View style={tw`mx-auto bg-purple-100 rounded-full w-[200px] h-[60px] shadow-sm`} />
                        </View>
                        
                        <View style={{ zIndex: 2 }}>
                            <FlatList
                                ref={flatListRef}
                                data={timeSlots}
                                renderItem={renderItem}
                                keyExtractor={(item) => item}
                                showsVerticalScrollIndicator={false}
                                getItemLayout={getItemLayout}
                                contentContainerStyle={{ paddingVertical: PICKER_PADDING }}
                                snapToInterval={ITEM_HEIGHT}
                                decelerationRate={0.5}
                                onMomentumScrollEnd={(event) => {
                                    const offsetY = event.nativeEvent.contentOffset.y;
                                    const index = Math.round((offsetY) / ITEM_HEIGHT);
                                    if (index >= 0 && index < timeSlots.length) {
                                        const time = timeSlots[index];
                                        setSelectedTime(time);
                                    }
                                }}
                            />
                        </View>
                    </View>

                    <TouchableOpacity 
                        style={tw`mx-6 py-3 bg-gray-600 rounded-xl flex-row justify-center items-center mb-8`}
                        onPress={() => {
                            onTimeSelected(selectedTime);
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

export default TimePickerBottomSheet; 