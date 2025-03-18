import { View, Text } from "react-native";
import tw from "twrnc";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface SpecialActivityCardProps {
    type: "day_start" | "day_end";
    title: string;
    startTime: string;
}

const getSpecialIcon = (type: "day_start" | "day_end") => {
    const iconSize = 32;
    
    switch (type) {
    case "day_start":
        return <MaterialCommunityIcons name="weather-sunny" size={iconSize} style={tw`text-amber-400`} />;
    case "day_end":
        return <MaterialCommunityIcons name="moon-waning-crescent" size={iconSize} style={tw`text-indigo-400`} />;
    }
};

const SpecialActivityCard = ({ 
    type,
    title,
    startTime
}: SpecialActivityCardProps) => {
    return (
        <View style={[tw`flex flex-row items-center w-full pr-4 h-[52px]`]}>
            <View 
                style={[
                    tw`w-[50px] h-[52px] rounded-full bg-slate-200 flex items-center justify-center`
                ]}
            >
                {getSpecialIcon(type)}
            </View>
            <View style={tw`ml-3 flex-1`}>
                <Text style={tw`text-gray-500 text-sm mb-1`}>
                    {startTime}
                </Text>
                <Text style={tw`text-gray-950 font-semibold text-lg`}>
                    {title}
                </Text>
            </View>
        </View>
    );
};

export default SpecialActivityCard; 