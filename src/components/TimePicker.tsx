import { useRef, useState, useEffect } from "react";
import { View, Text, FlatList } from "react-native";
import tw from "twrnc";
import Feather from "@expo/vector-icons/Feather";

interface TimePickerProps {
    onTimeSelected?: (_time: string) => void;
    initialTime: string;
    mode: "morning" | "evening";
}

const ITEM_HEIGHT = 60;
const VISIBLE_ITEMS = 5;
const PICKER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;
const PICKER_PADDING = PICKER_HEIGHT / 2 - ITEM_HEIGHT / 2;

const MORNING_TIME_SLOTS = [
    "4:00", "4:15", "4:30", "4:45", "5:00", "5:15", "5:30", "5:45", "6:00", "6:15", "6:30", "6:45", "7:00", "7:15", "7:30", "7:45", "8:00", "8:15", "8:30", "8:45", "9:00", "9:15", "9:30", "9:45", "10:00", "10:15", "10:30", "10:45", "11:00"
];

const EVENING_TIME_SLOTS = [
    "19:00", "19:15", "19:30", "19:45", "20:00", "20:15", "20:30", "20:45", "21:00", "21:15", "21:30", "21:45", "22:00", "22:15", "22:30", "22:45", "23:00", "23:15", "23:30", "23:45"
];

const TimePicker = ({ 
    onTimeSelected, 
    initialTime, 
    mode
}: TimePickerProps) => {
    const timeSlots = mode === "morning" ? MORNING_TIME_SLOTS : EVENING_TIME_SLOTS;
    const [selectedTime, setSelectedTime] = useState(initialTime);
    const flatListRef = useRef<FlatList>(null);
    const initialIndex = timeSlots.indexOf(initialTime);

    // Center the selected item when component mounts
    useEffect(() => {
        setTimeout(() => {
            flatListRef.current?.scrollToOffset({
                offset: initialIndex * ITEM_HEIGHT,
                animated: false
            });
        }, 100);
    }, [initialIndex]);

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
                    {isSelected && (
                        <Feather 
                            name={mode === "morning" ? "sun" : "moon"} 
                            size={30} 
                            style={tw`text-gray-950 mr-2`} 
                        />
                    )}
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
        <View style={tw`h-[${PICKER_HEIGHT}px] relative`}>
            <View style={[
                tw`absolute -z-10 left-0 right-0 h-[${ITEM_HEIGHT}px]`,
                { top: PICKER_HEIGHT / 2 - ITEM_HEIGHT / 2 }
            ]}>
                <View style={tw`mx-auto bg-white rounded-full w-[200px] h-[60px]`} />
            </View>
            
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
                        onTimeSelected?.(time);
                    }
                }}
            />
        </View>
    );
};

export default TimePicker;
