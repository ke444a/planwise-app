import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import tw from "twrnc";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import AntDesign from "@expo/vector-icons/AntDesign";
import Feather from "@expo/vector-icons/Feather";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { getActivityDurationLabel } from "@/utils/getActivityDurationLabel";

interface IBacklogItem {
    id: string;
    title: string;
    duration: number;
    isCompleted?: boolean;
}

const dummyTasks: IBacklogItem[] = [
    {
        id: "1",
        title: "Post junior challenge on LinkedIn",
        duration: 15,
    },
    {
        id: "2",
        title: "Look at poster & post design",
        duration: 15,
    },
    {
        id: "3",
        title: "Update website with sponsors",
        duration: 65,
    },
    {
        id: "4",
        title: "Review presentation slides",
        duration: 30,
    },
    {
        id: "5",
        title: "Send follow-up emails",
        duration: 20,
    },
    {
        id: "6",
        title: "Prepare meeting agenda",
        duration: 25,
    }
];

const BacklogItem = ({ task }: { task: IBacklogItem }) => {
    return (
        <View style={tw`flex-row items-center p-4 bg-white rounded-xl mb-3`}>
            <View style={tw`flex-1`}>
                <Text style={tw`text-gray-950 text-lg font-medium max-w-[80%] shrink`}>{task.title}</Text>
                <Text style={tw`text-gray-500 mt-1`}>{getActivityDurationLabel(task.duration)}</Text>
            </View>
            <TouchableOpacity 
                style={tw`h-6 w-6 rounded-full border-2 border-gray-500 items-center justify-center`}
                onPress={() => {
                    console.log("Task completed:", task.id);
                }}
            >
                {task.isCompleted && (
                    <Feather name="check" size={16} style={tw`text-purple-400`} />
                )}
            </TouchableOpacity>
        </View>
    );
};

const BacklogScreen = () => {
    const insets = useSafeAreaInsets();

    return (
        <View style={tw`flex-1 bg-purple-50`}>
            <View style={[tw`bg-purple-50`, { paddingTop: insets.top }]} />
            <View style={[tw`flex-1 bg-zinc-100 rounded-t-3xl`, styles.containerShadow]}>
                <View style={tw`px-4 pt-6`}>
                    <View style={tw`flex-row justify-between items-center mb-6`}>
                        <Text style={tw`text-2xl font-semibold text-gray-950`}>Your backlog</Text>
                        <TouchableOpacity onPress={() => router.back()}>
                            <AntDesign name="closecircle" size={24} style={tw`text-gray-500`} />
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity 
                        style={tw`flex-row items-center p-4 bg-white rounded-xl mb-6 border border-dashed border-gray-300`}
                        onPress={() => {
                            console.log("Add new backlog item manually");
                        }}
                    >
                        <View style={tw`w-8 h-8 rounded-full bg-purple-100 items-center justify-center mr-3`}>
                            <AntDesign name="plus" size={20} style={tw`text-purple-400`} />
                        </View>
                        <Text style={tw`text-gray-600 text-lg font-medium`}>Add new item</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView 
                    style={tw`px-4`}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={tw`pb-32`} // Extra padding for floating button
                >
                    {dummyTasks.map((task) => (
                        <BacklogItem key={task.id} task={task} />
                    ))}
                </ScrollView>
            </View>

            {/* Floating AI Chat Button */}
            <TouchableOpacity
                style={[
                    tw`absolute bottom-14 right-6 w-16 h-16 bg-purple-400 rounded-full items-center justify-center`,
                    styles.floatingButton
                ]}
                onPress={() => {
                    console.log("Open AI chat to create backlog items");
                }}
            >
                <MaterialCommunityIcons name="robot" size={35} style={tw`text-white`} />
            </TouchableOpacity>
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
    floatingButton: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    }
});

export default BacklogScreen;
