import { useState, useEffect, useRef } from "react";
import { View, ScrollView, Dimensions } from "react-native";
import tw from "twrnc";
import ActivityCard from "./ActivityCard";
import { timeToMinutes } from "@/utils/timeToMinutes";

interface ScheduleTimelineProps {
    startDayHour: number;
    endDayHour: number;
    activities: IActivity[];
    onActivityComplete?: (_activity: IActivity) => void;
    onActivityDelete?: (_activity: IActivity) => void;
    onActivityEdit?: (_activity: IActivity) => void;
    onActivityMoveToBacklog?: (_activity: IActivity) => void;
}

const TOTAL_ACTIVITY_SIZE_BY_ROW = {
    3: 90,
    4: 120,
    5: 150
};
const PIXELS_PER_DURATION_MIN = 1.5;
const PIXELS_PER_GAP_MIN = 0.9;
const DEFAULT_ACTIVITY_GAP = 16;
const MAX_ACTIVITY_GAP = 200;
const MIN_ACTIVITY_ICON_HEIGHT = 52;

const getActivityRows = (activity: IActivity) => {
    let rows = 3;
    if (activity.title.length >= 25) {
        rows += 1;
    }
    return rows;
};

const ScheduleTimeline = ({
    startDayHour,
    endDayHour,
    activities,
    onActivityComplete = () => {},
    onActivityDelete = () => {},
    onActivityEdit = () => {},
    onActivityMoveToBacklog = () => {}
}: ScheduleTimelineProps) => {
    const [currentTime, setCurrentTime] = useState(new Date());
    const scrollViewRef = useRef<ScrollView>(null);    
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(new Date());
        }, 30000);
    
        return () => clearInterval(interval);
    }, []);

    const getActivityHeight = (activity: IActivity) => {
        return Math.max(MIN_ACTIVITY_ICON_HEIGHT + (activity.duration - 15) * PIXELS_PER_DURATION_MIN, MIN_ACTIVITY_ICON_HEIGHT);
    };
    
    useEffect(() => {
        const currentHour = currentTime.getHours();
        const currentMinute = currentTime.getMinutes();
        const currentTimeInMinutes = currentHour * 60 + currentMinute;
        
        if (scrollViewRef.current && currentHour >= startDayHour && currentHour <= endDayHour) {
            let closestActivityIndex = 0;
            let minTimeDiff = Infinity;
            
            activities.forEach((activity, index) => {
                const activityStartMinutes = timeToMinutes(activity.startTime);
                const timeDiff = Math.abs(activityStartMinutes - currentTimeInMinutes);
                if (timeDiff < minTimeDiff) {
                    minTimeDiff = timeDiff;
                    closestActivityIndex = index;
                }
            });
            
            setTimeout(() => {
                if (scrollViewRef.current && activities.length > 0) {
                    const screenHeight = Dimensions.get("window").height;
                    let scrollPosition = 0;
                    
                    // If we found a close activity, scroll to it
                    if (closestActivityIndex < activities.length) {
                        // Calculate approximate position
                        for (let i = 0; i < closestActivityIndex; i++) {
                            const activity = activities[i];
                            scrollPosition += getActivityHeight(activity);
                            
                            // Add gap between activities
                            if (i < activities.length - 1) {
                                const nextActivity = activities[i + 1];
                                const gap = getGapBetweenActivities(activity, nextActivity);
                                scrollPosition += gap;
                            }
                        }
                        
                        // Adjust to show activity in the upper third of screen
                        scrollPosition = Math.max(0, scrollPosition - screenHeight / 3);
                    }
                    
                    scrollViewRef.current.scrollTo({ y: scrollPosition, animated: true });
                }
            }, 500);
        }
    });
    
    const getGapBetweenActivities = (activity1: IActivity, activity2: IActivity) => {
        const activity1EndMinutes = timeToMinutes(activity1.endTime);
        const activity2StartMinutes = timeToMinutes(activity2.startTime);
        const minutesBetween = activity2StartMinutes - activity1EndMinutes;
        
        // If activities are back-to-back with 15 minutes between them, use the default gap
        if (minutesBetween <= 15) {
            return DEFAULT_ACTIVITY_GAP;
        }
        return Math.min(minutesBetween * PIXELS_PER_GAP_MIN, MAX_ACTIVITY_GAP);
    };
    
    // Calculate the elapsed timeline percentage
    const getElapsedTimePosition = () => {
        const now = new Date();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        
        // If current time is not within day hours, return null
        if (currentHour < startDayHour || currentHour > endDayHour) {
            return null;
        }
        
        // Find the position where current time falls
        let elapsedHeight = 0;
        let currentActivityFound = false;
        const currentTimeInMinutes = currentHour * 60 + currentMinute;
        
        for (let i = 0; i < activities.length; i++) {
            const activity = activities[i];
            const activityStartMinutes = timeToMinutes(activity.startTime);
            const activityEndMinutes = timeToMinutes(activity.endTime);
            
            // If current time is before this activity starts
            if (currentTimeInMinutes < activityStartMinutes) {
                break;
            }
            
            // If current time is during this activity
            if (currentTimeInMinutes >= activityStartMinutes && currentTimeInMinutes < activityEndMinutes) {
                // Add full height for activities that have started
                elapsedHeight += MIN_ACTIVITY_ICON_HEIGHT / 2; // At least position at the middle of icon
                currentActivityFound = true;
                break;
            }
            
            // Add this activity's full height for past activities
            elapsedHeight += getActivityHeight(activity);
            
            // Add gap after this activity if not the last one
            if (i < activities.length - 1) {
                elapsedHeight += getGapBetweenActivities(activity, activities[i + 1]);
            }
        }
        
        // If no current activity was found but there are activities,
        // and we're within the day hours, position at the first activity
        if (!currentActivityFound && activities.length > 0 && 
            currentHour >= startDayHour && currentHour <= endDayHour) {
            const firstActivity = activities[0];
            const firstActivityStartMinutes = timeToMinutes(firstActivity.startTime);
            
            // If current time is before the first activity, position at start
            if (currentTimeInMinutes < firstActivityStartMinutes) {
                return 0;
            }
            
            // If we're past all activities, position at the end of the last one
            if (currentTimeInMinutes >= timeToMinutes(activities[activities.length-1].endTime)) {
                return elapsedHeight;
            }
        }
        
        return elapsedHeight;
    };
    
    const elapsedPosition = getElapsedTimePosition();
    
    // Check if activity is in the past
    const isActivityInPast = (activity: IActivity) => {
        const now = new Date();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        const currentTimeInMinutes = currentHour * 60 + currentMinute;
        
        const activityEndMinutes = timeToMinutes(activity.endTime);
        return currentTimeInMinutes > activityEndMinutes;
    };
    
    return (
        <ScrollView 
            ref={scrollViewRef}
            style={tw`flex-1`}
            contentContainerStyle={tw`px-4 py-8`}
            showsVerticalScrollIndicator={false}
        >
            <View style={tw`flex-row`}>
                {/* Activities column with timeline */}
                <View style={tw`flex-1`}>
                    {/* Background gray timeline line */}
                    <View 
                        style={[
                            tw`absolute bg-gray-300`,
                            { 
                                width: 2,
                                left: 25,
                                top: 0,
                                bottom: 0
                            }
                        ]} 
                    />
                    
                    {/* Red elapsed timeline line with current time */}
                    {elapsedPosition !== null && (
                        <View 
                            style={[
                                tw`absolute bg-purple-400`,
                                { 
                                    width: 2,
                                    left: 25,
                                    top: 0,
                                    height: elapsedPosition
                                }
                            ]} 
                        />
                    )}
                    
                    {activities.map((activity, index) => {
                        const activityHeight = getActivityHeight(activity);
                        const activityContainerHeight = TOTAL_ACTIVITY_SIZE_BY_ROW[getActivityRows(activity) as 3 | 4 | 5];
                        const isPastActivity = isActivityInPast(activity);

                        return (
                            <View key={index}>                                
                                <ActivityCard
                                    activity={activity} 
                                    iconHeight={activityHeight}
                                    containerHeight={activityContainerHeight}
                                    onActivityComplete={onActivityComplete}
                                    onActivityDelete={onActivityDelete}
                                    onActivityEdit={onActivityEdit}
                                    onActivityMoveToBacklog={onActivityMoveToBacklog}
                                    isPast={isPastActivity}
                                />
                                {index < activities.length - 1 && (
                                    <View style={{ height: getGapBetweenActivities(activity, activities[index + 1]) }} />
                                )}
                            </View>
                        );
                    })}
                </View>
            </View>
        </ScrollView>
    );
};

export default ScheduleTimeline;