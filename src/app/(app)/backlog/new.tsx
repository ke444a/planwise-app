import { useState, useMemo } from "react";
import { View, Text, TouchableOpacity, TextInput, StyleSheet } from "react-native";
import { router } from "expo-router";
import tw from "twrnc";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ButtonWithIcon } from "@/components/ui/ButtonWithIcon";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useUserStore } from "@/config/userStore";
import { useAddItemToBacklogMutation } from "@/api/backlog/addItemToBacklog";
import DurationSlider from "@/components/DurationSlider";
import DurationPickerBottomSheet from "@/components/DurationPickerBottomSheet";

const DEFAULT_DURATION_OPTIONS = [
    { label: "15m", value: 15 },
    { label: "30m", value: 30 },
    { label: "45m", value: 45 },
    { label: "1hr", value: 60 },
    { label: "1hr 30m", value: 90 }
];

const formatDuration = (minutes: number) => {
    if (minutes < 60) {
        return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}hr ${remainingMinutes}m` : `${hours}hr`;
};

const NewTaskScreen = () => {
    const insets = useSafeAreaInsets();
    const { user } = useUserStore();
    const { mutate: addItemToBacklog } = useAddItemToBacklogMutation();
    const [isDurationPickerVisible, setIsDurationPickerVisible] = useState(false);
    const [durationOptions, setDurationOptions] = useState(DEFAULT_DURATION_OPTIONS);
    
    const [title, setTitle] = useState("");
    const [duration, setDuration] = useState(DEFAULT_DURATION_OPTIONS[0].value);

    const { initialHours, initialMinutes } = useMemo(() => ({
        initialHours: Math.floor(duration / 60),
        initialMinutes: duration % 60
    }), [duration]);

    const handleSave = () => {
        if (!user?.uid || !title.trim()) return;

        addItemToBacklog({
            item: {
                title: title.trim(),
                duration,
                itemType: "draft",
                isCompleted: false,
            },
            uid: user.uid
        }, {
            onSuccess: () => {
                router.back();
            }
        });
    };

    const handleClose = () => {
        router.back();
    };

    const handleDurationConfirm = (totalMinutes: number) => {
        setDuration(totalMinutes);
        
        const newDurationOptions = DEFAULT_DURATION_OPTIONS;
        const isNewOption = !newDurationOptions.some(opt => opt.value === totalMinutes);
        if (isNewOption) {
            newDurationOptions.push({ label: formatDuration(totalMinutes), value: totalMinutes });
        }
        setDurationOptions(newDurationOptions);
    };

    return (
        <View style={tw`flex-1 bg-purple-50`}>
            <View style={[tw`bg-purple-50`, { paddingTop: insets.top }]} />
            <View style={[tw`flex-1 bg-white rounded-t-3xl`, styles.containerShadow]}>
                {/* Header */}
                <View style={tw`px-4 py-6`}>
                    <TouchableOpacity onPress={handleClose} style={tw`flex-row items-center gap-x-2`}>
                        <Ionicons name="chevron-back" size={24} style={tw`text-purple-500`} />
                        <Text style={tw`text-2xl font-medium text-purple-500`}>New item</Text>
                    </TouchableOpacity>
                </View>

                {/* Content */}
                <View style={tw`px-4 flex-1`}>
                    <View style={tw`mb-16`}>
                        <Text style={tw`text-2xl font-semibold text-gray-950 mb-2`}>What?</Text>
                        <TextInput
                            style={tw`border-b border-gray-300 py-2 text-xl text-gray-950`}
                            value={title}
                            onChangeText={setTitle}
                            autoFocus
                        />
                    </View>

                    <View>
                        <View style={tw`flex-row items-center justify-between mb-4`}>
                            <Text style={tw`text-2xl font-semibold text-gray-950`}>How long?</Text>
                            <TouchableOpacity onPress={() => setIsDurationPickerVisible(true)}>
                                <Text style={tw`text-purple-500 font-medium text-lg`}>Custom...</Text>
                            </TouchableOpacity>
                        </View>
                        <DurationSlider
                            options={durationOptions}
                            initialValue={DEFAULT_DURATION_OPTIONS[0].value}
                            onValueChange={setDuration}
                        />
                    </View>
                </View>

                {/* Footer */}
                <View style={[tw`px-4`, { paddingBottom: insets.bottom }]}>
                    <ButtonWithIcon
                        label="Add to backlog"
                        onPress={handleSave}
                        iconPosition="left"
                        fullWidth
                        icon={<Ionicons name="checkmark-done" size={24} style={tw`text-gray-950`} />}
                        disabled={!title.trim()}
                    />
                </View>

                <DurationPickerBottomSheet 
                    visible={isDurationPickerVisible}
                    onClose={() => setIsDurationPickerVisible(false)}
                    onDurationSelected={handleDurationConfirm}
                    initialHours={initialHours}
                    initialMinutes={initialMinutes}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    containerShadow: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
});

export default NewTaskScreen;