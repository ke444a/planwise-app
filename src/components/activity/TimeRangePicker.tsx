import { useRef, useState, useEffect } from "react";
import { View, Text, FlatList } from "react-native";
import tw from "twrnc";
import { addMinutesToTime } from "@/utils/addMinutesToTime";

interface TimeRangePickerProps {
    onTimeSelected?: (_time: { start: string; end: string }) => void;
    initialTime: string;
    durationMinutes: number;
}

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

const TIME_SLOTS = generateTimeSlots();

const TimeRangePicker = ({ 
    onTimeSelected, 
    initialTime,
    durationMinutes
}: TimeRangePickerProps) => {
    const [selectedTime, setSelectedTime] = useState(initialTime);
    const flatListRef = useRef<FlatList>(null);
    const initialIndex = TIME_SLOTS.indexOf(initialTime);

    // Calculate end time based on selected time and duration
    const endTime = addMinutesToTime(selectedTime, durationMinutes);

    // Update selectedTime when initialTime changes
    useEffect(() => {
        if (initialTime && TIME_SLOTS.includes(initialTime)) {
            setSelectedTime(initialTime);
            const index = TIME_SLOTS.indexOf(initialTime);
            flatListRef.current?.scrollToOffset({
                offset: index * ITEM_HEIGHT,
                animated: true
            });
        }
    }, [initialTime]);

    // Initial scroll setup - only if we have a valid initial time
    useEffect(() => {
        if (initialIndex !== -1) {
            setTimeout(() => {
                flatListRef.current?.scrollToOffset({
                    offset: initialIndex * ITEM_HEIGHT,
                    animated: false
                });
            }, 100);
        }
    }, []); // Run only once on mount

    const getItemLayout = (_: any, index: number) => ({
        length: ITEM_HEIGHT,
        offset: ITEM_HEIGHT * index,
        index,
    });

    const renderItem = ({ item, index }: { item: string; index: number }) => {
        const isSelected = item === selectedTime;
        const selectedIndex = TIME_SLOTS.indexOf(selectedTime);
        const relativePosition = Math.abs(index - selectedIndex);
        
        let opacity = 1;
        if (relativePosition >= 2) opacity = 0.3;
        
        return (
            <View style={tw`h-[${ITEM_HEIGHT}px] justify-center items-center`}>
                <Text style={[
                    tw`text-base text-gray-950 px-4`,
                    isSelected && tw`text-lg font-semibold`,
                    !isSelected && tw`font-normal`,
                    { opacity }
                ]}>
                    {isSelected ? `${item} - ${endTime}` : item}
                </Text>
            </View>
        );
    };

    return (
        <View style={tw`items-center`}>
            <View style={[tw`h-[${PICKER_HEIGHT}px] relative`, { width: PICKER_WIDTH }]}>
                <View style={[
                    tw`absolute -z-10 left-0 right-0 h-[${ITEM_HEIGHT}px]`,
                    { top: PICKER_HEIGHT / 2 - ITEM_HEIGHT / 2 }
                ]}>
                    <View style={tw`bg-purple-100 rounded-full w-full h-[50px]`} />
                </View>
                
                <FlatList
                    ref={flatListRef}
                    data={TIME_SLOTS}
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
                        if (index >= 0 && index < TIME_SLOTS.length) {
                            const time = TIME_SLOTS[index];
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