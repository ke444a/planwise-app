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
import { useState, useEffect } from "react";
import ActivityIcon from "@/components/ui/ActivityIcon";
import ActivityTypePickerBottomSheet from "@/components/ActivityTypePickerBottomSheet";
import { convertActivityTypeToStr } from "@/utils/convertActivityTypeToStr";
import TimeRangePicker from "@/components/TimeRangePicker";
import { PrioritySection } from "@/components/PrioritySection";
import { StaminaSection } from "@/components/StaminaSection";
import { LogBox } from "react-native";
import { useUserStore } from "@/config/userStore";
import { useGetBacklogItemQuery } from "@/api/backlog/getBacklogItem";
import { useDeleteItemFromBacklogMutation } from "@/api/backlog/deleteItemFromBacklog";
import { useAddActivityToScheduleMutation } from "@/api/schedules/addActivityToSchedule";
import { DatePickerSection } from "@/components/DatePickerSection";

const ConvertToActivityScreen = () => {
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
    const [selectedDate, setSelectedDate] = useState(new Date()); // Default to current date

    // Fetch backlog item data
    const { data: item, isLoading } = useGetBacklogItemQuery(id as string, user?.uid || "");
    const { mutate: deleteFromBacklog } = useDeleteItemFromBacklogMutation();
    const { mutate: addToSchedule } = useAddActivityToScheduleMutation();

    // State for activity
    const [title, setTitle] = useState("");
    const [activityType, setActivityType] = useState<ActivityType>("misc");
    const [isTypePickerVisible, setIsTypePickerVisible] = useState(false);
    const [duration, setDuration] = useState(15);
    const [selectedTime, setSelectedTime] = useState({ start: "09:00", end: "09:15" });
    const [priority, setPriority] = useState<ActivityPriority>("must_do");
    const [stamina, setStamina] = useState(0);
    const [subtasks, setSubtasks] = useState<ISubtask[]>([]);
    const [subtaskInput, setSubtaskInput] = useState("");

    // Pre-fill form with item data
    useEffect(() => {
        if (item) {
            setTitle(item.title);
            setDuration(item.duration);
            setSubtasks(item.subtasks);
            
            if (item.itemType === "activity") {
                setActivityType(item.type);
                setPriority(item.priority);
                setStamina(item.staminaCost);
                setSelectedTime({
                    start: item.startTime,
                    end: item.endTime
                });
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

    const handleAddToSchedule = () => {
        if (!title.trim() || !user?.uid || !id || !item) return;

        const activity: IActivity = {
            title: title.trim(),
            type: activityType,
            startTime: selectedTime.start,
            endTime: selectedTime.end,
            duration,
            priority,
            staminaCost: stamina,
            subtasks,
            isCompleted: false,
        };

        // Add to schedule first
        addToSchedule({ 
            activity, 
            date: selectedDate, 
            uid: user.uid 
        }, {
            onSuccess: () => {
                // Then delete from backlog
                deleteFromBacklog({ 
                    id: id as string, 
                    uid: user.uid 
                });
                router.back();
            }
        });
    };

    if (isLoading || !item) {
        return null; // Or show a loading spinner
    }

    return (
        <View style={tw`flex-1 bg-purple-50`}>
            <View style={[tw`bg-purple-50`, { paddingTop: insets.top }]} />
            <View style={[
                tw`flex-1 bg-white rounded-t-3xl`,
                styles.containerShadow
            ]}>
                {/* Header */}
                <View style={tw`flex-row justify-between items-center px-4 py-6`}>
                    <Text style={tw`text-2xl font-semibold`}>Add to Schedule</Text>
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
                    <View style={tw`mb-4`}>
                        <Text style={tw`text-2xl font-semibold text-gray-950 mb-4`}>When?</Text>
                        <TimeRangePicker
                            initialTime={selectedTime.start}
                            durationMinutes={duration}
                            onTimeSelected={handleTimeSelected}
                        />
                    </View>

                    {/* Date Section */}
                    <DatePickerSection
                        selectedDate={selectedDate}
                        onDateChange={setSelectedDate}
                    />

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
                        label="Add to Schedule"
                        onPress={handleAddToSchedule}
                        iconPosition="left"
                        fullWidth
                        icon={<Ionicons name="calendar" size={24} style={tw`text-gray-950`} />}
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
};

const styles = StyleSheet.create({
    containerShadow: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4
    }
});

export default ConvertToActivityScreen; 