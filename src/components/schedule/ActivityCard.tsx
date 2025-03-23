import { View, Text, TouchableOpacity } from "react-native";
import tw from "twrnc";
import Ionicons from "@expo/vector-icons/Ionicons";
import { timeToMinutes } from "@/utils/timeToMinutes";
import { getTimeRemainingText } from "@/utils/getTimeRemainingText";
import { getActivityDurationLabel } from "@/utils/getActivityDurationLabel";
import { useState } from "react";
import ActivityDetailsModal from "@/components/schedule/ActivityDetailsModal";
import ActivityIcon from "../activity/ActivityIcon";
import { getPriorityLabel } from "@/utils/getPriorityLabel";

const getActivityCheckmarkColor = (isCompleted: boolean, priority: ActivityPriority) => {
    switch (priority) {
    case "must_do":
        return isCompleted ? "bg-rose-400 border-rose-400" : "border-rose-400";
    case "get_it_done":
        return isCompleted ? "bg-orange-400 border-orange-400" : "border-orange-400";
    case "nice_to_have":
    case "routine":
        return isCompleted ? "bg-blue-500 border-blue-500" : "border-blue-500";
    }
};

const getIsCurrentActivity = (startTime: string, endTime: string): boolean => {
    const now = new Date();
    const currentHours = now.getHours();
    const currentMinutes = now.getMinutes();
    const currentTotalMinutes = currentHours * 60 + currentMinutes;
    
    const startTotalMinutes = timeToMinutes(startTime);
    const endTotalMinutes = timeToMinutes(endTime);
    return currentTotalMinutes >= startTotalMinutes && currentTotalMinutes < endTotalMinutes;
};

const getActivityProgress = (startTime: string, endTime: string): number => {
    const now = new Date();
    const currentHours = now.getHours();
    const currentMinutes = now.getMinutes();
    const currentTotalMinutes = currentHours * 60 + currentMinutes;
    
    const startTotalMinutes = timeToMinutes(startTime);
    const endTotalMinutes = timeToMinutes(endTime);
    
    if (currentTotalMinutes < startTotalMinutes) return 0;
    if (currentTotalMinutes >= endTotalMinutes) return 100;
    
    const totalDuration = endTotalMinutes - startTotalMinutes;
    const elapsed = currentTotalMinutes - startTotalMinutes;
    return (elapsed / totalDuration) * 100;
};

interface ActivityCardProps {
    activity: IActivity;
    iconHeight: number;
    containerHeight: number;
    activityDate: Date;
    onActivityComplete: (_activity: IActivity) => void;
    onActivityDelete: (_activity: IActivity) => void;
    onActivityEdit: (_activity: IActivity) => void;
    onActivityMoveToBacklog: (_activity: IActivity) => void;
    isPast?: boolean;
}

const ActivityCard = ({ 
    activity, 
    iconHeight, 
    containerHeight,
    activityDate,
    onActivityComplete,
    onActivityDelete,
    onActivityEdit,
    onActivityMoveToBacklog,
    isPast = false
}: ActivityCardProps) => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const isCurrentActivity = getIsCurrentActivity(activity.startTime, activity.endTime);
    const activityProgress = isCurrentActivity ? getActivityProgress(activity.startTime, activity.endTime) : 0;
    const checkmarkColor = getActivityCheckmarkColor(activity.isCompleted, activity.priority);
    
    return (
        <>
            <View style={[tw`flex flex-row items-center w-full pr-4`, { minHeight: containerHeight }]}>
                <TouchableOpacity 
                    style={tw`flex-1 flex-row items-center`}
                    onPress={() => setIsModalVisible(true)}
                >
                    <View style={tw`relative`}>
                        {/* Icon background with progress indicator */}
                        <View 
                            style={[
                                tw`w-[50px] rounded-full items-center justify-center z-10 overflow-hidden`,
                                { height: iconHeight }
                            ]}
                        >
                            {/* Background color layer */}
                            <View style={[
                                tw`absolute inset-0 bg-slate-200`,
                            ]} />
                            
                            {/* Progress fill for current activity */}
                            {isCurrentActivity && (
                                <View 
                                    style={[
                                        tw`absolute bg-purple-200 left-0 top-0 right-0`,
                                        { height: `${activityProgress}%` }
                                    ]}
                                />
                            )}
                            
                            {/* Past activity fill */}
                            {isPast && (
                                <View style={tw`absolute inset-0 bg-purple-200`} />
                            )}
                            
                            {/* Icon centered on top */}
                            <View style={tw`z-10`}>
                                <ActivityIcon 
                                    activityType={activity.type} 
                                    activityPriority={activity.priority} 
                                    color={isPast ? "text-white" : undefined}
                                />
                            </View>
                        </View>
                    </View>
                    <View style={tw`ml-3 flex-1`}>
                        {isCurrentActivity ? (
                            <Text style={tw`text-gray-500 text-sm mb-1`}>
                                {getTimeRemainingText(activity.endTime)}
                            </Text>
                        ) : (
                            <Text style={tw`text-gray-500 text-sm mb-1`}>
                                {activity.startTime}-{activity.endTime} ({getActivityDurationLabel(activity.duration)})
                            </Text>
                        )}
                        
                        <Text 
                            style={[
                                tw`text-gray-950 font-semibold text-lg mb-1`,
                                activity.isCompleted && tw`line-through opacity-70`
                            ]}
                        >
                            {activity.title}
                        </Text>
                        
                        {/* Bottom row with stamina, priority, and subtasks */}
                        <View style={tw`flex-row flex-wrap gap-2 max-w-[220px] items-center`}>
                            {activity.subtasks && activity.subtasks.length > 0 && (
                                <View style={tw`flex-row items-center p-1`}>
                                    <Text style={tw`text-gray-500 font-medium`}>
                                        {activity.subtasks.filter(task => task.isCompleted).length}/{activity.subtasks.length}
                                    </Text>
                                    <Ionicons name="checkbox" size={16} style={tw`ml-1 text-gray-500`} />
                                </View>
                            )}
                            <View style={tw`flex-row items-center p-1`}>
                                <Text style={tw`text-gray-500 font-medium mr-1`}>{activity.staminaCost}</Text>
                                <Ionicons name="flash" size={16} style={tw`text-gray-500`} />
                            </View>
                            {activity.priority !== "routine" && (
                                <View style={tw`p-1`}>
                                    <Text style={tw`font-medium text-gray-500`}>{getPriorityLabel(activity.priority)}</Text>
                                </View>
                            )}
                        </View>
                    </View>
                </TouchableOpacity>
                
                {/* Completion checkmark on the right */}
                <TouchableOpacity onPress={() => onActivityComplete(activity)}>
                    <View 
                        style={[
                            tw`w-[30px] h-[30px] rounded-full items-center justify-center border-2`,
                            tw`${checkmarkColor}`
                        ]}
                    >
                        {activity.isCompleted && (
                            <Ionicons name="checkmark" size={24} color="white" />
                        )}
                    </View>
                </TouchableOpacity>
            </View>

            <ActivityDetailsModal
                activity={activity}
                visible={isModalVisible}
                activityDate={activityDate}
                onClose={() => setIsModalVisible(false)}
                onComplete={() => {
                    onActivityComplete(activity);
                    setIsModalVisible(false);
                }}
                onDelete={() => {
                    onActivityDelete(activity);
                    setIsModalVisible(false);
                }}
                onEdit={() => {
                    onActivityEdit(activity);
                    setIsModalVisible(false);
                }}
                onMoveToBacklog={() => {
                    onActivityMoveToBacklog(activity);
                    setIsModalVisible(false);
                }}
            />
        </>
    );
};

export default ActivityCard;