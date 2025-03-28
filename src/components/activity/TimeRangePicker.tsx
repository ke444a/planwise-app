import { useRef, useState, useEffect, useMemo } from "react";
import { View, Text, FlatList } from "react-native";
import tw from "twrnc";
import { addMinutesToTime } from "@/utils/addMinutesToTime";

interface TimeRangePickerProps {
    onTimeSelected?: (_time: { start: string; end: string }) => void;
    initialTime: string;
    durationMinutes: number;
}

// Layout constants
const ITEM_HEIGHT = 50;
const VISIBLE_ITEMS = 5;
const PICKER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;
const PICKER_PADDING = PICKER_HEIGHT / 2 - ITEM_HEIGHT / 2;
const PICKER_WIDTH = 200;

// Generate all time slots from 00:00 to 23:45 with 15-minute intervals
const generateTimeSlots = () => {
    const slots: string[] = [];
    for (let hour = 0; hour < 24; hour++) {
        for (let minute = 0; minute < 60; minute += 15) {
            const hourStr = hour.toString().padStart(2, "0");
            const minuteStr = minute.toString().padStart(2, "0");
            slots.push(`${hourStr}:${minuteStr}`);
        }
    }
    return slots;
};

/**
 * Picker that allows the user to select a start time of activity.
 * User scrolls through the list of time slots and selects the start time.
 * The end time is calculated based on the duration passed as a prop.
 */
const TimeRangePicker = ({ 
    onTimeSelected, 
    initialTime,
    durationMinutes
}: TimeRangePickerProps) => {
    const [selectedTime, setSelectedTime] = useState(initialTime);
    const timeSlots = useMemo(() => generateTimeSlots(), []);
    const flatListRef = useRef<FlatList>(null);
    const initialIndex = timeSlots.indexOf(initialTime);
    const endTime = addMinutesToTime(selectedTime, durationMinutes);

    useEffect(() => {
        if (initialTime && timeSlots.includes(initialTime)) {
            setSelectedTime(initialTime);
            const index = timeSlots.indexOf(initialTime);
            flatListRef.current?.scrollToOffset({
                offset: index * ITEM_HEIGHT,
                animated: true
            });
        }
    }, [initialTime]);

    useEffect(() => {
        if (initialIndex !== -1) {
            setTimeout(() => {
                flatListRef.current?.scrollToOffset({
                    offset: initialIndex * ITEM_HEIGHT,
                    animated: false
                });
            }, 100);
        }
    }, []);

    const getItemLayout = (_: any, index: number) => ({
        length: ITEM_HEIGHT,
        offset: ITEM_HEIGHT * index,
        index,
    });

    const renderItem = ({ item, index }: { item: string; index: number }) => {
        const isSelected = item === selectedTime;
        const selectedIndex = timeSlots.indexOf(selectedTime);
        const relativePosition = Math.abs(index - selectedIndex);
        
        let opacity = 1;
        if (relativePosition >= 2) opacity = 0.3;
        
        return (
            <View style={tw`h-[${ITEM_HEIGHT}px] justify-center items-center`}>
                <Text style={[
                    tw`text-base text-gray-950 px-4 dark:text-white`,
                    isSelected && tw`text-lg font-semibold text-gray-950`,
                    !isSelected && tw`font-normal`,
                    { opacity }
                ]}>
                    {isSelected ? `${item} - ${endTime}` : item}
                </Text>
            </View>
        );
    };

    return (
        <View style={tw`items-center`} testID="time-range-picker">
            <View style={[tw`h-[${PICKER_HEIGHT}px] relative`, { width: PICKER_WIDTH }]}>
                <View style={[
                    tw`absolute -z-10 left-0 right-0 h-[${ITEM_HEIGHT}px]`,
                    { top: PICKER_HEIGHT / 2 - ITEM_HEIGHT / 2 }
                ]}>
                    <View style={tw`bg-purple-100 rounded-full w-full h-[50px]`} />
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
                    nestedScrollEnabled={true}
                    onMomentumScrollEnd={(event) => {
                        const offsetY = event.nativeEvent.contentOffset.y;
                        const index = Math.round((offsetY) / ITEM_HEIGHT);
                        if (index >= 0 && index < timeSlots.length) {
                            const time = timeSlots[index];
                            setSelectedTime(time);
                            onTimeSelected?.({ start: time, end: addMinutesToTime(time, durationMinutes) });
                        }
                    }}
                />
            </View>
        </View>
    );
};

export default TimeRangePicker; 