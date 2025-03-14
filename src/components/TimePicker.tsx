import { useRef, useState, useEffect } from "react";
import { View, Text, FlatList } from "react-native";
import tw from "twrnc";
import { MorningTimeOptions } from "../const/TimeOptions";
import { EveningTimeOptions } from "../const/TimeOptions";
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

const TimePicker: React.FC<TimePickerProps> = ({ 
    onTimeSelected, 
    initialTime, 
    mode
}) => {
    const [selectedTime, setSelectedTime] = useState(initialTime);
    const flatListRef = useRef<FlatList>(null);
    const timeOptions = mode === "morning" ? MorningTimeOptions : EveningTimeOptions;
    const initialIndex = timeOptions.indexOf(initialTime);

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
        const selectedIndex = timeOptions.indexOf(selectedTime);
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
                        {item}
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
                data={timeOptions}
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
                    if (index >= 0 && index < timeOptions.length) {
                        const time = timeOptions[index];
                        setSelectedTime(time);
                        onTimeSelected?.(time);
                    }
                }}
            />
        </View>
    );
};

export default TimePicker;
