import { useState } from "react";
import { View, Text } from "react-native";
import tw from "twrnc";
import { ButtonWithIcon } from "@/components/ui/ButtonWithIcon";
import TimePicker from "@/components/TimePicker";
import { Ionicons } from "@expo/vector-icons";

interface StartTimeScreenProps {
    onNextPress: (_time: string) => void;
}

const StartTimeScreen: React.FC<StartTimeScreenProps> = ({ onNextPress }) => {
    const [selectedTime, setSelectedTime] = useState("8:30");

    const handleNextPress = () => {
        onNextPress(selectedTime);
    };

    return (
        <View style={tw`flex-1 justify-between`}>
            <View>
                <Text style={tw`text-3xl font-semibold text-gray-950 mb-3 max-w-[70%]`}>
                        When do You Want to Start Your Day?
                </Text>
                <Text style={tw`text-lg text-gray-500 font-medium mb-8`}>
                        Tell me the earliest time you want to start tackling tasks.
                </Text>
                <TimePicker 
                    initialTime={selectedTime}
                    onTimeSelected={setSelectedTime}
                    mode="morning"
                />
            </View>
                
            <View style={tw`mt-4`}>
                <ButtonWithIcon
                    label="Next"
                    onPress={handleNextPress}
                    iconPosition="left"
                    fullWidth
                    icon={<Ionicons name="arrow-forward" size={24} style={tw`text-gray-950`} />}
                    disabled={selectedTime === ""}
                />
            </View>
        </View>
    );
};

export default StartTimeScreen; 