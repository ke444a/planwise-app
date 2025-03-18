import { TouchableOpacity, View, Text } from "react-native";
import tw from "twrnc";
import Entypo from "@expo/vector-icons/Entypo";
import { formatDate } from "@/utils/formatDate";

interface DateNavigationProps {
    currentDate: Date;
    setCurrentDate: (_newDate: Date) => void;
}

const HeaderDateNavigation = ({ 
    currentDate, 
    setCurrentDate 
}: DateNavigationProps) => {    
    const goToPreviousDay = () => {
        const newDate = new Date(currentDate);
        newDate.setDate(newDate.getDate() - 1);
        setCurrentDate(newDate);
    };
    
    const goToNextDay = () => {
        const newDate = new Date(currentDate);
        newDate.setDate(newDate.getDate() + 1);
        setCurrentDate(newDate);
    };

    return (
        <View style={tw`flex-row items-center justify-between px-4 py-6`}>
            <TouchableOpacity onPress={goToPreviousDay}>
                <Entypo name="chevron-left" size={28} color="#333" />
            </TouchableOpacity>
        
            <Text style={tw`text-xl font-bold text-gray-800`}>{formatDate(currentDate)}</Text>
        
            <TouchableOpacity onPress={goToNextDay}>
                <Entypo name="chevron-right" size={28} color="#333" />
            </TouchableOpacity>
        </View>
    );
};

export default HeaderDateNavigation;
