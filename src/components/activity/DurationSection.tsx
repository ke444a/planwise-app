import { View, Text, TouchableOpacity } from "react-native";
import tw from "twrnc";
import { useState, useMemo, useEffect } from "react";
import DurationSlider from "@/components/activity/DurationSlider";
import DurationPickerBottomSheet from "@/components/activity/DurationPickerBottomSheet";

const DEFAULT_DURATION_OPTIONS = [
    { label: "15m", value: 15 },
    { label: "30m", value: 30 },
    { label: "45m", value: 45 },
    { label: "1hr", value: 60 },
    { label: "1hr 30m", value: 90 }
];

interface DurationSectionProps {
    duration: number;
    onDurationChange: (_duration: number) => void;
}

const formatDuration = (minutes: number) => {
    if (minutes < 60) {
        return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}hr ${remainingMinutes}m` : `${hours}hr`;
};

export const DurationSection = ({ duration, onDurationChange }: DurationSectionProps) => {
    const [isDurationPickerVisible, setIsDurationPickerVisible] = useState(false);
    const [durationOptions, setDurationOptions] = useState(DEFAULT_DURATION_OPTIONS);

    const { initialHours, initialMinutes } = useMemo(() => ({
        initialHours: Math.floor(duration / 60),
        initialMinutes: duration % 60
    }), [duration]);

    const handleDurationConfirm = (totalMinutes: number) => {
        onDurationChange(totalMinutes);
        
        const newDurationOptions = [...DEFAULT_DURATION_OPTIONS];
        const isNewOption = !newDurationOptions.some(opt => opt.value === totalMinutes);
        if (isNewOption) {
            newDurationOptions.push({ label: formatDuration(totalMinutes), value: totalMinutes });
            newDurationOptions.sort((a, b) => a.value - b.value);
        }
        setDurationOptions(newDurationOptions);
    };

    useEffect(() => {
        const newDurationOptions = [...DEFAULT_DURATION_OPTIONS];
        const isNewOption = !newDurationOptions.some(opt => opt.value === duration);
        if (isNewOption) {
            newDurationOptions.push({ label: formatDuration(duration), value: duration });
            newDurationOptions.sort((a, b) => a.value - b.value);
        }
        setDurationOptions(newDurationOptions);
    }, [duration]);

    return (
        <View testID="duration-section">
            <View style={tw`flex-row items-center justify-between mb-4`}>
                <Text style={tw`text-2xl font-semibold text-gray-950 dark:text-white`}>How Long?</Text>
                <TouchableOpacity onPress={() => setIsDurationPickerVisible(true)}>
                    <Text style={tw`text-gray-500 font-medium text-lg dark:text-gray-300`}>More...</Text>
                </TouchableOpacity>
            </View>
            <DurationSlider
                options={durationOptions}
                value={duration}
                onValueChange={onDurationChange}
            />

            <DurationPickerBottomSheet 
                visible={isDurationPickerVisible}
                onClose={() => setIsDurationPickerVisible(false)}
                onDurationSelected={handleDurationConfirm}
                initialHours={initialHours}
                initialMinutes={initialMinutes}
            />
        </View>
    );
}; 