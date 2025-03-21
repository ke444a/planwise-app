import { Text, TouchableOpacity, View, TextInput } from "react-native";
import tw from "twrnc";
import ActivityIcon from "@/components/activity/ActivityIcon";
import { ACTIVITY_TYPE_TO_STR } from "@/libs/constants";

interface Props {
    title: string;
    type: ActivityType;
    priority: ActivityPriority;
    onTitleChange: (_title: string) => void;
    setIsTypePickerVisible: (_visible: boolean) => void;
}

const ActivityTypeAndTitlePicker = ({ 
    title, 
    type, 
    priority, 
    onTitleChange,
    setIsTypePickerVisible
}: Props) => {
    return (
        <View style={tw`flex-row items-center`}>
            <TouchableOpacity 
                onPress={() => setIsTypePickerVisible(true)}
                style={tw`h-14 w-14 bg-gray-100 rounded-lg items-center justify-center mr-3`}
            >
                <ActivityIcon
                    activityType={type}
                    activityPriority={priority}
                    iconSize={30}
                />
            </TouchableOpacity>
            <View style={tw`flex-1`}>
                <TextInput
                    style={tw`border-b border-gray-300 text-xl text-gray-950 mb-3 py-1`}
                    value={title}
                    onChangeText={onTitleChange}
                    placeholder="What?"
                />
                <Text style={tw`text-gray-500 text-sm font-medium`}>{ACTIVITY_TYPE_TO_STR[type]}</Text>
            </View>
        </View>
    );
};

export default ActivityTypeAndTitlePicker;