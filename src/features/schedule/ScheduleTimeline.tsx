import { useState, useEffect, useRef } from "react";
import { View, Text, ScrollView, Dimensions } from "react-native";
import tw from "twrnc";
import ActivityCard from "./ActivityCard";
import { timeToMinutes } from "@/utils/timeToMinutes";

interface ScheduleTimelineProps {
    startDayHour: number;
    endDayHour: number;
    activities: IActivity[];
}

// Constants for timeline sizing
const PIXELS_PER_MINUTE = 1.5;
const MIN_ACTIVITY_HEIGHT = 52; // Minimum height for activities 30 mins or less
const ACTIVITY_GAP = 16; // Gap between activities
const TIMELINE_DOT_SIZE = 12; // Size of dots on the timeline
const LARGE_GAP_THRESHOLD = 120; // 2 hours in minutes - threshold for dashed line
const TIMELINE_WIDTH = 24; // Width of the timeline column

const ScheduleTimeline = ({ 
    startDayHour, 
    endDayHour, 
    activities 
}: ScheduleTimelineProps) => {
    const [currentTime, setCurrentTime] = useState(new Date());
    const scrollViewRef = useRef<ScrollView>(null);
    
    // Update current time every 30 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(new Date());
        }, 30000);
    
        return () => clearInterval(interval);
    }, []);
    
    // Sort activities by start time
    const sortedActivities = [...activities].sort((a, b) => {
        const aStartMinutes = timeToMinutes(a.startTime);
        const bStartMinutes = timeToMinutes(b.startTime);
        return aStartMinutes - bStartMinutes;
    });
    
    // Calculate current time in minutes since day start
    const currentHour = currentTime.getHours();
    const currentMinute = currentTime.getMinutes();
    const dayStartInMinutes = startDayHour * 60;
    const currentTimeInMinutes = currentHour * 60 + currentMinute;
    
    // Scroll to current time on initial render
    useEffect(() => {
        if (scrollViewRef.current && currentHour >= startDayHour && currentHour <= endDayHour) {
            // Find the activity closest to current time
            let closestActivityIndex = 0;
            let minTimeDiff = Infinity;
            
            sortedActivities.forEach((activity, index) => {
                const activityStartMinutes = timeToMinutes(activity.startTime);
                const timeDiff = Math.abs(activityStartMinutes - currentTimeInMinutes);
                if (timeDiff < minTimeDiff) {
                    minTimeDiff = timeDiff;
                    closestActivityIndex = index;
                }
            });
            
            // Calculate scroll position based on activity positions
            setTimeout(() => {
                if (scrollViewRef.current && sortedActivities.length > 0) {
                    const screenHeight = Dimensions.get("window").height;
                    let scrollPosition = 0;
                    
                    // If we found a close activity, scroll to it
                    if (closestActivityIndex < sortedActivities.length) {
                        // Calculate approximate position
                        for (let i = 0; i < closestActivityIndex; i++) {
                            const activity = sortedActivities[i];
                            scrollPosition += getActivityHeight(activity);
                            
                            // Add gap between activities
                            if (i < sortedActivities.length - 1) {
                                const nextActivity = sortedActivities[i + 1];
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
    }, []);
    
    // Helper function to calculate activity height
    const getActivityHeight = (activity: IActivity) => {
        return activity.duration <= 30 
            ? MIN_ACTIVITY_HEIGHT 
            : Math.max(MIN_ACTIVITY_HEIGHT, activity.duration * PIXELS_PER_MINUTE);
    };
    
    // Helper function to calculate gap between activities
    const getGapBetweenActivities = (activity1: IActivity, activity2: IActivity) => {
        const activity1EndMinutes = timeToMinutes(activity1.endTime);
        const activity2StartMinutes = timeToMinutes(activity2.startTime);
        const minutesBetween = activity2StartMinutes - activity1EndMinutes;
        
        // If activities are back-to-back or overlapping, use minimum gap
        if (minutesBetween <= 0) {
            return ACTIVITY_GAP;
        }
        
        // For small gaps, use a proportional gap
        if (minutesBetween < LARGE_GAP_THRESHOLD) {
            return Math.min(minutesBetween * PIXELS_PER_MINUTE, ACTIVITY_GAP * 3);
        }
        
        // For large gaps, use a standard larger gap
        return ACTIVITY_GAP * 4;
    };
    
    // Determine if a gap is large (for dashed line)
    const isLargeGap = (activity1: IActivity, activity2: IActivity) => {
        const activity1EndMinutes = timeToMinutes(activity1.endTime);
        const activity2StartMinutes = timeToMinutes(activity2.startTime);
        return (activity2StartMinutes - activity1EndMinutes) >= LARGE_GAP_THRESHOLD;
    };
    
    // Format time for display
    const formatTimeRange = (startTime: string, endTime: string, duration: number) => {
        const durationText = duration >= 60 
            ? `(${Math.floor(duration / 60)} hr${duration >= 120 ? "s" : ""}${duration % 60 > 0 ? ` ${duration % 60} min` : ""})`
            : `(${duration} min)`;
        return `${startTime}-${endTime} ${durationText}`;
    };
    
    // Render timeline
    return (
        <ScrollView 
            ref={scrollViewRef}
            style={tw`flex-1`}
            contentContainerStyle={tw`px-4 py-8`}
            showsVerticalScrollIndicator={false}
        >
            <View style={tw`flex-row`}>
                {/* Timeline column */}
                <View style={[tw`items-center`, { width: TIMELINE_WIDTH }]}>
                    {/* Continuous timeline with dots */}
                    <View style={tw`h-full relative items-center`}>
                        {/* Vertical line that spans the entire timeline */}
                        <View style={tw`absolute h-full w-0.5 bg-slate-200`} />
                        
                        {/* Activity dots positioned absolutely */}
                        {sortedActivities.map((activity, index) => {
                            // Calculate position for this dot
                            let dotPosition = 0;
                            for (let i = 0; i < index; i++) {
                                dotPosition += getActivityHeight(sortedActivities[i]);
                                if (i < sortedActivities.length - 1) {
                                    dotPosition += getGapBetweenActivities(sortedActivities[i], sortedActivities[i + 1]);
                                }
                            }
                            
                            // Add half of the current activity's height to center the dot
                            dotPosition += getActivityHeight(activity) / 2;
                            
                            const isCurrentlyActive = 
                                currentTimeInMinutes >= timeToMinutes(activity.startTime) && 
                                currentTimeInMinutes < timeToMinutes(activity.endTime);
                            
                            // Determine if the connection to the next activity should be dashed
                            const showDashedLine = index < sortedActivities.length - 1 && 
                                isLargeGap(activity, sortedActivities[index + 1]);
                            
                            return (
                                <View 
                                    key={`dot-${activity.id}`} 
                                    style={[
                                        tw`absolute z-10`,
                                        { top: dotPosition - TIMELINE_DOT_SIZE / 2 }
                                    ]}
                                >
                                    <View 
                                        style={[
                                            tw`rounded-full border-2 border-white`,
                                            { 
                                                width: TIMELINE_DOT_SIZE, 
                                                height: TIMELINE_DOT_SIZE,
                                                backgroundColor: isCurrentlyActive ? "#3b82f6" : "#e2e8f0"
                                            }
                                        ]} 
                                    />
                                    
                                    {/* If this is the last activity before a dashed section, add a special marker */}
                                    {showDashedLine && (
                                        <View 
                                            style={[
                                                tw`absolute w-0.5 bg-slate-200`,
                                                { 
                                                    top: TIMELINE_DOT_SIZE,
                                                    height: 20,
                                                    left: TIMELINE_DOT_SIZE / 2 - 0.5,
                                                    borderStyle: "dashed",
                                                    borderWidth: 1,
                                                    borderColor: "#cbd5e1",
                                                    backgroundColor: "transparent"
                                                }
                                            ]} 
                                        />
                                    )}
                                </View>
                            );
                        })}
                    </View>
                </View>
                
                {/* Activities column */}
                <View style={tw`flex-1`}>
                    {sortedActivities.map((activity, index) => {
                        const activityHeight = getActivityHeight(activity);
                        const isCurrentlyActive = 
                            currentTimeInMinutes >= timeToMinutes(activity.startTime) && 
                            currentTimeInMinutes < timeToMinutes(activity.endTime);
                        
                        return (
                            <View key={activity.id} style={tw`mb-4`}>
                                {/* Time label */}
                                <Text style={tw`text-gray-500 text-xs mb-1`}>
                                    {isCurrentlyActive 
                                        ? `${Math.max(0, Math.floor((timeToMinutes(activity.endTime) - currentTimeInMinutes)))} min remaining`
                                        : formatTimeRange(activity.startTime, activity.endTime, activity.duration)
                                    }
                                </Text>
                                
                                {/* Activity card */}
                                <ActivityCard 
                                    activity={activity} 
                                    activityHeight={activityHeight}
                                />
                                
                                {/* Gap between activities */}
                                {index < sortedActivities.length - 1 && (
                                    <View style={{ height: getGapBetweenActivities(activity, sortedActivities[index + 1]) - 16 }} />
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