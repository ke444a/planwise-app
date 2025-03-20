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
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import SubtasksList from "@/components/SubtasksList";

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
    const [subtasks, setSubtasks] = useState<string[]>([]);
    const [subtaskInput, setSubtaskInput] = useState("");

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
                subtasks: subtasks.map(task => ({
                    title: task,
                    isCompleted: false
                })),
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
        
        const newDurationOptions = [...DEFAULT_DURATION_OPTIONS];
        const isNewOption = !newDurationOptions.some(opt => opt.value === totalMinutes);
        if (isNewOption) {
            newDurationOptions.push({ label: formatDuration(totalMinutes), value: totalMinutes });
            newDurationOptions.sort((a, b) => a.value - b.value);
        }
        setDurationOptions(newDurationOptions);
    };

    const handleAddSubtask = () => {
        if (subtaskInput.trim()) {
            setSubtasks([...subtasks, subtaskInput.trim()]);
            setSubtaskInput("");
        }
    };

    const handleRemoveSubtask = (index: number) => {
        setSubtasks(subtasks.filter((_, i) => i !== index));
    };

    const handleSubtaskSubmit = () => {
        handleAddSubtask();
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
                    <View style={tw`mb-10 flex-row items-center`}>
                        <View style={tw`h-14 w-14 bg-slate-200 rounded-lg items-center justify-center mr-3`}>
                            <MaterialCommunityIcons name="text-box-outline" size={30} style={tw`text-gray-600`} />
                        </View>
                        <TextInput
                            style={tw`border-b border-gray-300 py-2 text-xl text-gray-950 flex-1`}
                            value={title}
                            onChangeText={setTitle}
                            autoFocus
                            placeholder="What?"
                        />
                    </View>

                    <View style={tw`mb-10`}>
                        <View style={tw`flex-row items-center justify-between mb-4`}>
                            <Text style={tw`text-2xl font-semibold text-gray-950`}>How long?</Text>
                            <TouchableOpacity onPress={() => setIsDurationPickerVisible(true)}>
                                <Text style={tw`text-gray-500 font-medium text-lg`}>More...</Text>
                            </TouchableOpacity>
                        </View>
                        <DurationSlider
                            options={durationOptions}
                            value={duration}
                            onValueChange={setDuration}
                        />
                    </View>

                    <SubtasksList
                        subtasks={subtasks}
                        subtaskInput={subtaskInput}
                        onSubtaskInputChange={setSubtaskInput}
                        onSubtaskSubmit={handleSubtaskSubmit}
                        onSubtaskRemove={handleRemoveSubtask}
                    />
                </View>

                {/* Footer */}
                <View style={[tw`px-4`, { paddingBottom: insets.bottom }]}>
                    <ButtonWithIcon
                        label="Create"
                        onPress={handleSave}
                        iconPosition="left"
                        fullWidth
                        icon={<Ionicons name="checkmark" size={24} style={tw`text-gray-950`} />}
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