import { View, Text, ScrollView, StyleSheet, TextInput } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import tw from "twrnc";
import { TouchableOpacity } from "react-native";
import AntDesign from "@expo/vector-icons/AntDesign";
import { ButtonWithIcon } from "@/components/ui/ButtonWithIcon";
import Ionicons from "@expo/vector-icons/Ionicons";
import { DurationSection } from "@/components/DurationSection";
import { SubtasksSection } from "@/components/SubtasksSection";
import { useState, useEffect, useMemo } from "react";
import ActivityIcon from "@/components/ui/ActivityIcon";
import ActivityTypePickerBottomSheet from "@/components/ActivityTypePickerBottomSheet";
import { convertActivityTypeToStr } from "@/utils/convertActivityTypeToStr";
import TimeRangePicker from "@/components/TimeRangePicker";
import { PrioritySection } from "@/components/PrioritySection";
import { StaminaSection } from "@/components/StaminaSection";
import { LogBox } from "react-native";
import { useUserStore } from "@/config/userStore";
import { useUpdateBacklogItemMutation } from "@/api/backlog/updateBacklogItem";
import DurationSlider from "@/components/DurationSlider";
import DurationPickerBottomSheet from "@/components/DurationPickerBottomSheet";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useGetBacklogItemQuery } from "@/api/backlog/getBacklogItem";

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

const EditBacklogItemScreen = () => {
    // Temporary fix for warning
    useEffect(() => {
        const logMessage = "VirtualizedLists should never be nested inside plain ScrollViews with the same orientation";
        LogBox.ignoreLogs([logMessage]);

        return () => {
            LogBox.ignoreAllLogs();
        };
    }, []);

    const insets = useSafeAreaInsets();
    const { id } = useLocalSearchParams();
    const { user } = useUserStore();

    // Fetch backlog item data
    const { data: item, isLoading } = useGetBacklogItemQuery(id as string, user?.uid || "");

    // State for both activity and draft
    const [title, setTitle] = useState("");
    const [duration, setDuration] = useState(15);
    const [subtasks, setSubtasks] = useState<ISubtask[]>([]);
    const [subtaskInput, setSubtaskInput] = useState("");

    // State for activity type only
    const [activityType, setActivityType] = useState<ActivityType>("misc");
    const [isTypePickerVisible, setIsTypePickerVisible] = useState(false);
    const [selectedTime, setSelectedTime] = useState({ start: "09:00", end: "09:15" });
    const [priority, setPriority] = useState<ActivityPriority>("must_do");
    const [stamina, setStamina] = useState(0);

    // State for draft type only
    const [isDurationPickerVisible, setIsDurationPickerVisible] = useState(false);
    const [durationOptions, setDurationOptions] = useState(DEFAULT_DURATION_OPTIONS);

    const { mutate: updateBacklogItem } = useUpdateBacklogItemMutation();

    const { initialHours, initialMinutes } = useMemo(() => ({
        initialHours: Math.floor(duration / 60),
        initialMinutes: duration % 60
    }), [duration]);

    // Pre-fill form with item data
    useEffect(() => {
        if (item) {
            setTitle(item.title);
            setDuration(item.duration);
            setSubtasks(item.subtasks);

            if (item.itemType === "activity") {
                setActivityType(item.type);
                setSelectedTime({ start: item.startTime, end: item.endTime });
                setPriority(item.priority);
                setStamina(item.staminaCost);
            }
        }
    }, [item]);

    const handleClose = () => {
        router.back();
    };

    const handleSubtaskSubmit = () => {
        if (subtaskInput.trim()) {
            const newSubtask = {
                id: Math.random().toString(36).substring(2, 8),
                title: subtaskInput.trim(),
                isCompleted: false
            };
            setSubtasks([...subtasks, newSubtask]);
            setSubtaskInput("");
        }
    };

    const handleSubtaskRemove = (id: string) => {
        setSubtasks(subtasks.filter(subtask => subtask.id !== id));
    };

    const handleTimeSelected = (time: { start: string; end: string }) => {
        setSelectedTime(time);
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

    const handleUpdateItem = () => {
        if (!title.trim() || !user?.uid || !id || !item) return;
        const baseItem = {
            id: id as string,
            title: title.trim(),
            duration,
            subtasks,
            isCompleted: item.isCompleted,
        };
        const updatedItem = item.itemType === "activity" 
            ? {
                ...baseItem,
                itemType: "activity" as const,
                type: activityType,
                startTime: selectedTime.start,
                endTime: selectedTime.end,
                priority,
                staminaCost: stamina,
            }
            : {
                ...baseItem,
                itemType: "draft" as const,
            };

        updateBacklogItem({ 
            item: updatedItem, 
            uid: user.uid 
        });
        router.back();
    };

    if (isLoading || !item) {
        return null; // Or show a loading spinner
    }

    if (item.itemType === "activity") {
        return (
            <View style={tw`flex-1 bg-purple-50`}>
                <View style={[tw`bg-purple-50`, { paddingTop: insets.top }]} />
                <View style={[
                    tw`flex-1 bg-white rounded-t-3xl`,
                    styles.containerShadow
                ]}>
                    {/* Header */}
                    <View style={tw`flex-row justify-between items-center px-4 py-6`}>
                        <Text style={tw`text-2xl font-semibold`}>Edit Activity</Text>
                        <TouchableOpacity onPress={handleClose}>
                            <AntDesign name="closecircle" size={24} style={tw`text-gray-500`} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={tw`flex-1 px-4`} showsVerticalScrollIndicator={false}>
                        {/* Activity Type and Title Section */}
                        <View style={tw`mb-10 flex-row items-center`}>
                            <TouchableOpacity 
                                onPress={() => setIsTypePickerVisible(true)}
                                style={tw`h-14 w-14 bg-gray-100 rounded-lg items-center justify-center mr-3`}
                            >
                                <ActivityIcon
                                    activityType={activityType}
                                    activityPriority={priority}
                                    iconSize={30}
                                />
                            </TouchableOpacity>
                            <View style={tw`flex-1`}>
                                <TextInput
                                    style={tw`border-b border-gray-300 text-xl text-gray-950 mb-3 py-1`}
                                    value={title}
                                    onChangeText={setTitle}
                                    placeholder="What?"
                                />
                                <Text style={tw`text-gray-500 text-sm font-medium`}>{convertActivityTypeToStr([activityType])}</Text>
                            </View>
                        </View>

                        {/* When Section */}
                        <View style={tw`mb-8`}>
                            <Text style={tw`text-2xl font-semibold text-gray-950 mb-4`}>When?</Text>
                            <TimeRangePicker
                                initialTime={selectedTime.start}
                                durationMinutes={duration}
                                onTimeSelected={handleTimeSelected}
                            />
                        </View>

                        {/* Duration Section */}
                        <View style={tw`mb-8`}>
                            <DurationSection
                                duration={duration}
                                onDurationChange={setDuration}
                            />
                        </View>

                        {/* Priority Section */}
                        <View style={tw`mb-8`}>
                            <PrioritySection
                                selectedPriority={priority}
                                onPriorityChange={setPriority}
                            />
                        </View>

                        {/* Stamina Section */}
                        <StaminaSection
                            value={stamina}
                            onValueChange={setStamina}
                        />

                        {/* Subtasks Section */}
                        <View style={tw`mb-8`}>
                            <SubtasksSection
                                subtasks={subtasks}
                                subtaskInput={subtaskInput}
                                onSubtaskInputChange={setSubtaskInput}
                                onSubtaskSubmit={handleSubtaskSubmit}
                                onSubtaskRemove={handleSubtaskRemove}
                            />
                        </View>
                    </ScrollView>

                    {/* Footer */}
                    <View style={[tw`px-4 py-4 bg-white`, { paddingBottom: insets.bottom }]}>
                        <ButtonWithIcon
                            label="Update"
                            onPress={handleUpdateItem}
                            iconPosition="left"
                            fullWidth
                            icon={<Ionicons name="checkmark" size={24} style={tw`text-gray-950`} />}
                            disabled={!title.trim()}
                        />
                    </View>

                    <ActivityTypePickerBottomSheet
                        visible={isTypePickerVisible}
                        onClose={() => setIsTypePickerVisible(false)}
                        onTypeSelected={setActivityType}
                        selectedType={activityType}
                    />
                </View>
            </View>
        );
    }

    // Draft type UI
    return (
        <View style={tw`flex-1 bg-purple-50`}>
            <View style={[tw`bg-purple-50`, { paddingTop: insets.top }]} />
            <View style={[tw`flex-1 bg-white rounded-t-3xl`, styles.containerShadow]}>
                {/* Header */}
                <View style={tw`px-4 py-6`}>
                    <TouchableOpacity onPress={handleClose} style={tw`flex-row items-center gap-x-2`}>
                        <Ionicons name="chevron-back" size={24} style={tw`text-purple-500`} />
                        <Text style={tw`text-2xl font-medium text-purple-500`}>Edit item</Text>
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

                    <SubtasksSection
                        subtasks={subtasks}
                        subtaskInput={subtaskInput}
                        onSubtaskInputChange={setSubtaskInput}
                        onSubtaskSubmit={handleSubtaskSubmit}
                        onSubtaskRemove={handleSubtaskRemove}
                    />
                </View>

                {/* Footer */}
                <View style={[tw`px-4`, { paddingBottom: insets.bottom }]}>
                    <ButtonWithIcon
                        label="Update"
                        onPress={handleUpdateItem}
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
        shadowRadius: 4
    }
});

export default EditBacklogItemScreen; 