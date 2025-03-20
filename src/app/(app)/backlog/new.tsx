import { useState } from "react";
import { View, Text, TouchableOpacity, TextInput } from "react-native";
import { router } from "expo-router";
import tw from "twrnc";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ButtonWithIcon } from "@/components/ui/ButtonWithIcon";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useUserStore } from "@/config/userStore";
import { useAddItemToBacklogMutation } from "@/api/backlog/addItemToBacklog";
// import Slider from "@react-native-community/slider";

const DURATION_OPTIONS = [
    { label: "15m", minutes: 15 },
    { label: "30m", minutes: 30 },
    { label: "45m", minutes: 45 },
    { label: "1hr", minutes: 60 },
    { label: "1hr 30m", minutes: 90 },
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
    
    const [title, setTitle] = useState("");
    const [duration, setDuration] = useState(15);

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

    return (
        <View style={[tw`flex-1 bg-white`, { paddingTop: insets.top }]}>
            {/* Header */}
            <View style={tw`px-4 py-4 flex-row items-center justify-between border-b border-gray-200`}>
                <TouchableOpacity onPress={handleClose}>
                    <Text style={tw`text-gray-500 text-lg`}>Cancel</Text>
                </TouchableOpacity>
                <Text style={tw`text-xl font-semibold`}>New item</Text>
                <View style={tw`w-16`} /> {/* Spacer for alignment */}
            </View>

            {/* Content */}
            <View style={tw`px-4 pt-6 flex-1`}>
                <View>
                    <Text style={tw`text-base font-medium text-gray-600 mb-2`}>What?</Text>
                    <TextInput
                        style={tw`border-b border-gray-300 py-2 text-lg text-gray-900`}
                        placeholder="Enter task title"
                        value={title}
                        onChangeText={setTitle}
                        autoFocus
                    />
                </View>

                <View style={tw`mt-8`}>
                    <View style={tw`flex-row items-center justify-between mb-4`}>
                        <Text style={tw`text-base font-medium text-gray-600`}>How long?</Text>
                        <Text style={tw`text-purple-500 font-medium`}>{formatDuration(duration)}</Text>
                    </View>
                    {/* <Slider
                        style={tw`h-12`}
                        minimumValue={15}
                        maximumValue={90}
                        step={15}
                        value={duration}
                        onValueChange={setDuration}
                        minimumTrackTintColor="#9333ea"
                        maximumTrackTintColor="#e5e7eb"
                        thumbTintColor="#7e22ce"
                    /> */}
                    <View style={tw`flex-row justify-between mt-2`}>
                        {DURATION_OPTIONS.map((option) => (
                            <Text 
                                key={option.label} 
                                style={tw`text-sm text-gray-500 font-medium`}
                            >
                                {option.label}
                            </Text>
                        ))}
                    </View>
                </View>
            </View>

            {/* Footer */}
            <View style={tw`px-4 pb-8`}>
                <ButtonWithIcon
                    label="Add to backlog"
                    onPress={handleSave}
                    iconPosition="left"
                    fullWidth
                    icon={<Ionicons name="arrow-forward" size={24} style={tw`text-white`} />}
                    disabled={!title.trim()}
                />
            </View>
        </View>
    );
};

export default NewTaskScreen; 