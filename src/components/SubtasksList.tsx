import { View, Text, TextInput, Pressable } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import tw from "twrnc";
import Animated, { FadeInDown, LinearTransition } from "react-native-reanimated";

interface SubtasksListProps {
    subtasks: ISubtask[];
    subtaskInput: string;
    onSubtaskInputChange: (_text: string) => void;
    onSubtaskSubmit: () => void;
    onSubtaskRemove: (_id: string) => void;
}

const SubtasksList = ({
    subtasks,
    subtaskInput,
    onSubtaskInputChange,
    onSubtaskSubmit,
    onSubtaskRemove
}: SubtasksListProps) => {
    return (
        <View>
            <Text style={tw`text-2xl font-semibold text-gray-950 mb-4`}>Any subtasks?</Text>
            <View style={tw`gap-y-2`}>
                {subtasks.map((subtask, index) => (
                    <Animated.View 
                        key={subtask.id} 
                        entering={FadeInDown.duration(300).delay(index * 100)}
                        layout={LinearTransition.springify()}
                        style={tw`flex-row items-center justify-between bg-slate-200 rounded-lg px-4 py-3`}
                    >
                        <View style={tw`flex-row items-center flex-1 gap-x-3`}>
                            <Ionicons name="list" size={20} style={tw`text-gray-950`} />
                            <Text style={tw`text-gray-950 flex-1 text-lg`}>{subtask.title}</Text>
                        </View>
                        <Pressable 
                            onPress={() => onSubtaskRemove(subtask.id)}
                            hitSlop={8}
                        >
                            <Ionicons name="close" size={20} style={tw`text-gray-500`} />
                        </Pressable>
                    </Animated.View>
                ))}
                <View style={tw`flex-row items-center bg-slate-200 rounded-lg px-4`}>
                    <Ionicons name="list" size={20} style={tw`text-gray-950 opacity-30 mr-3`} />
                    <TextInput
                        style={[tw`flex-1 text-gray-950 text-lg py-3`]}
                        value={subtaskInput}
                        onChangeText={onSubtaskInputChange}
                        onSubmitEditing={onSubtaskSubmit}
                        placeholder="Add subtask"
                        returnKeyType="done"
                    />
                </View>
            </View>
        </View>
    );
};

export default SubtasksList; 