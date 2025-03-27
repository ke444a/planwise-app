import { useState, useCallback, useMemo } from "react";
import { View, Text, ScrollView } from "react-native";
import tw from "twrnc";
import BottomSheet from "../ui/BottomSheet";

// Layout constants
const ITEM_HEIGHT = 48;
const VISIBLE_COUNT = 5;
const PICKER_HEIGHT = ITEM_HEIGHT * VISIBLE_COUNT;
const HOURS_COLUMN_WIDTH = 65;
const MINUTES_COLUMN_WIDTH = 65;
const SUFFIX_WIDTH = 25;
const COLUMN_GAP = 36;
const SUFFIX_GAP = 12;
const CONTAINER_WIDTH = HOURS_COLUMN_WIDTH + SUFFIX_WIDTH + COLUMN_GAP + MINUTES_COLUMN_WIDTH + SUFFIX_WIDTH + 48;

interface Props {
    visible: boolean;
    onClose: () => void;
    onDurationSelected: (_totalMinutes: number) => void;
    initialHours: number;
    initialMinutes: number;
}

/**
 * This is a time picker with scrollable hours and minutes.
 * User can select the duration of the activity by scrolling through two columns.
 * The first column is for the hours and the second is for the minutes.
 */
const DurationPickerBottomSheet = ({
    visible,
    onClose,
    onDurationSelected,
    initialHours,
    initialMinutes,
}: Props) => {
    const [selectedHour, setSelectedHour] = useState(initialHours);
    const [selectedMinute, setSelectedMinute] = useState(initialMinutes);

    // Populate all possible values for hours and minutes
    const hours = useMemo(() => Array.from({ length: 24 }, (_, i) => i), []);
    const minutes = useMemo(() => Array.from({ length: 60 }, (_, i) => i), []);

    const handleClose = () => {
        const total = selectedHour * 60 + selectedMinute;
        onDurationSelected(total);
        onClose();
    };

    const onHoursMomentumScrollEnd = useCallback((e: any) => {
        const index = Math.round(e.nativeEvent.contentOffset.y / ITEM_HEIGHT);
        setSelectedHour(hours[index]);
    }, [hours]);
    const onMinutesMomentumScrollEnd = useCallback((e: any) => {
        const index = Math.round(e.nativeEvent.contentOffset.y / ITEM_HEIGHT);
        setSelectedMinute(minutes[index]);
    }, [minutes]);

    const renderHourItem = useCallback((value: number) => {
        const isSelected = value === selectedHour;
        const textColor = isSelected ? "text-gray-950" : "text-gray-600";

        return (
            <View key={value} style={tw`h-[${ITEM_HEIGHT}px] justify-center items-center`}>
                <Text style={tw`${textColor} text-xl font-medium`}>
                    {value}
                </Text>
            </View>
        );
    }, [selectedHour]);

    const renderMinuteItem = useCallback((value: number) => {
        const displayVal = value < 10 ? `0${value}` : `${value}`;
        const isSelected = value === selectedMinute;
        const textColor = isSelected ? "text-gray-950" : "text-gray-600";

        return (
            <View key={value} style={tw`h-[${ITEM_HEIGHT}px] justify-center items-center`}>
                <Text style={tw`${textColor} text-xl font-medium`}>
                    {displayVal}
                </Text>
            </View>
        );
    }, [selectedMinute]);

    return (
        <BottomSheet visible={visible} onClose={handleClose}>
            {/* Hours & minutes side-by-side */}
            <View style={tw`flex-row justify-center mt-3 h-[${PICKER_HEIGHT}px]`}>
                <View style={tw`relative w-[${CONTAINER_WIDTH}px] h-[${PICKER_HEIGHT}px] flex-row justify-center`}>
                    {/* Hours column with fixed suffix */}
                    <View style={tw`flex-row items-center mx-[${COLUMN_GAP / 2}px]`}>
                        <ScrollView
                            style={{ width: HOURS_COLUMN_WIDTH }}
                            snapToInterval={ITEM_HEIGHT}
                            decelerationRate="fast"
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={{
                                paddingVertical: (PICKER_HEIGHT - ITEM_HEIGHT) / 2,
                            }}
                            onMomentumScrollEnd={onHoursMomentumScrollEnd}
                            contentOffset={{ x: 0, y: initialHours * ITEM_HEIGHT }}
                        >
                            {hours.map(renderHourItem)}
                        </ScrollView>
                        <Text style={tw`text-xl font-medium text-gray-950 ml-[${SUFFIX_GAP}px] w-[${SUFFIX_WIDTH}px]`}>h</Text>
                    </View>

                    {/* Minutes column with fixed suffix */}
                    <View style={tw`flex-row items-center mx-[${COLUMN_GAP / 2}px]`}>
                        <ScrollView
                            style={{ width: MINUTES_COLUMN_WIDTH }}
                            snapToInterval={ITEM_HEIGHT}
                            decelerationRate="fast"
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={{
                                paddingVertical: (PICKER_HEIGHT - ITEM_HEIGHT) / 2,
                            }}
                            onMomentumScrollEnd={onMinutesMomentumScrollEnd}
                            contentOffset={{ x: 0, y: initialMinutes * ITEM_HEIGHT }}
                        >
                            {minutes.map(renderMinuteItem)}
                        </ScrollView>
                        <Text style={tw`text-xl font-medium text-gray-950 ml-[${SUFFIX_GAP}px] w-[${SUFFIX_WIDTH}px]`}>m</Text>
                    </View>

                    {/* Translucent highlight overlay */}
                    <View
                        style={tw`absolute h-[${ITEM_HEIGHT}px] bg-purple-100 rounded-xl top-[${(PICKER_HEIGHT - ITEM_HEIGHT) / 2}px] left-0 w-[${CONTAINER_WIDTH}px] -z-10`}
                    />
                </View>
            </View>
        </BottomSheet>
    );
};

export default DurationPickerBottomSheet;