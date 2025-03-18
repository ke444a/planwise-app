// import { useState, useEffect, useRef } from "react";
// import { View, Text, FlatList, Dimensions } from "react-native";
// import tw from "twrnc";
// import ActivityCard from "./ActivityCard";
// import { formatCurrentTime } from "@/utils/formatCurrentTime";

// interface ScheduleTimelineProps {
//     startDayHour: number;
//     endDayHour: number;
//     activities: IActivity[];
// }

// const PIXELS_PER_MINUTE = 1.5;
// const MIN_ACTIVITY_HEIGHT = 52;
// const MIN_HOUR_HEIGHT = 100;

// const { height: SCREEN_HEIGHT } = Dimensions.get("window");


// // Group activities by hour
// const groupActivitiesByHour = (activities: IActivity[], startHour: number, endHour: number) => {
//     const hourlyData = [];
    
//     for (let hour = startHour; hour <= endHour; hour++) {
//         const activitiesInHour = activities.filter(activity => {
//             const startHourNum = parseInt(activity.startTime.split(":")[0]);
//             const endHourNum = parseInt(activity.endTime.split(":")[0]);
            
//             // Include activities that start in this hour or span across this hour
//             return (startHourNum === hour) || 
//                    (startHourNum < hour && endHourNum > hour) ||
//                    (startHourNum < hour && endHourNum === hour);
//         });
        
//         hourlyData.push({
//             hour,
//             activities: activitiesInHour
//         });
//     }
    
//     return hourlyData;
// };

// const ScheduleTimelineDraft = ({ 
//     startDayHour, 
//     endDayHour, 
//     activities
// }: ScheduleTimelineProps) => {
//     const [currentTime, setCurrentTime] = useState(new Date());  
//     useEffect(() => {
//         const interval = setInterval(() => {
//             setCurrentTime(new Date());
//         }, 30000);
    
//         return () => clearInterval(interval);
//     }, []);

//     const flatListRef = useRef<FlatList>(null);
//     // useEffect(() => {
//     //     const currentHour = currentTime.getHours();
//     //     if (currentHour >= startDayHour && currentHour <= endDayHour) {
//     //         const indexToScroll = currentHour - startDayHour;
//     //         setTimeout(() => {
//     //             flatListRef.current?.scrollToIndex({
//     //                 index: indexToScroll,
//     //                 animated: true,
//     //                 viewOffset: SCREEN_HEIGHT * 0.3 // scroll to position current hour ~30% from the top
//     //             });
//     //         }, 500);
//     //     }
//     // }, [currentTime, endDayHour, startDayHour]);
    
//     const calculateHourHeight = (hourData: { hour: number, activities: IActivity[] }) => {
//         const baseHourHeight = PIXELS_PER_MINUTE * 60;
//         if (hourData.activities.length === 0) return baseHourHeight;
        
//         let maxHeight = 0;
//         hourData.activities.forEach(activity => {
//             const startHour = parseInt(activity.startTime.split(":")[0]);
//             const startMinute = parseInt(activity.startTime.split(":")[1]);
//             const endHour = parseInt(activity.endTime.split(":")[0]);
//             const endMinute = parseInt(activity.endTime.split(":")[1]);
            
//             // If activity spans multiple hours, only count the portion in this hour
//             let durationInThisHour;
//             if (startHour === hourData.hour && endHour > hourData.hour) {
//                 // Activity starts in this hour but ends later
//                 durationInThisHour = 60 - startMinute;
//             } else if (startHour < hourData.hour && endHour === hourData.hour) {
//                 // Activity started earlier but ends in this hour
//                 durationInThisHour = endMinute;
//             } else if (startHour === hourData.hour && endHour === hourData.hour) {
//                 // Activity starts and ends in this hour
//                 durationInThisHour = endMinute - startMinute;
//             } else if (startHour < hourData.hour && endHour > hourData.hour) {
//                 // Activity spans this entire hour
//                 durationInThisHour = 60;
//             } else {
//                 durationInThisHour = 0;
//             }
            
//             const activityHeight = Math.max(MIN_ACTIVITY_HEIGHT, durationInThisHour * PIXELS_PER_MINUTE);
//             maxHeight += activityHeight;
//         });
//         return Math.max(maxHeight, MIN_HOUR_HEIGHT);
//     };
    
//     const getItemLayout = (data: any, index: number) => {
//         const hourData = data[index];
//         const height = calculateHourHeight(hourData);
//         const offset = data.slice(0, index).reduce((sum: number, item: any) => 
//             sum + calculateHourHeight(item), 0);
        
//         return { length: height, offset, index };
//     };

//     const renderHourRow = ({ item }: { item: { hour: number, activities: IActivity[] } }) => {
//         const hourHeight = calculateHourHeight(item);
//         const showCurrentTime = currentTime.getHours() === item.hour;
//         let currentTimeOffset = 0;
//         if (showCurrentTime) {
//             currentTimeOffset = currentTime.getMinutes() * PIXELS_PER_MINUTE;
//         }
        
//         return (
//             <View style={[tw`flex-row`, { height: hourHeight }]}>
//                 {/* Hour column */}
//                 <View style={tw`w-16 items-center pt-1`}>
//                     <Text style={tw`text-gray-500 font-medium`}>{item.hour}:00</Text>                    
//                     {showCurrentTime && (
//                         <Text style={[tw`text-gray-950 font-medium mt-2`, { top: currentTimeOffset + 4 }]}>
//                             {formatCurrentTime(currentTime)}
//                         </Text>
//                     )}
//                 </View>
                
//                 {/* Activities column */}
//                 <View style={tw`flex-1 relative`}>
//                     {/* Activities that start in this hour */}
//                     {item.activities.map(activity => {
//                         const startHour = parseInt(activity.startTime.split(":")[0]);
//                         const activityHeight = Math.max(MIN_ACTIVITY_HEIGHT, activity.duration * PIXELS_PER_MINUTE);
//                         if (startHour === item.hour) {
//                             return (
//                                 <ActivityCard 
//                                     key={activity.id} 
//                                     activity={activity} 
//                                     activityHeight={activityHeight}
//                                 />
//                             );
//                         }
//                         return null;
//                     })}
//                 </View>
//             </View>
//         );
//     };
        
//     return (
//         <View style={tw`flex-1 pt-8`}>            
//             <FlatList
//                 ref={flatListRef}
//                 data={groupActivitiesByHour(activities, startDayHour, endDayHour)}
//                 renderItem={renderHourRow}
//                 keyExtractor={(item) => item.hour.toString()}
//                 getItemLayout={getItemLayout}
//                 showsVerticalScrollIndicator={false}
//             />
//         </View>
//     );
// };

// export default ScheduleTimelineDraft; 



// import { useState, useEffect, useRef } from "react";
// import { View, Text, ScrollView, Dimensions } from "react-native";
// import tw from "twrnc";
// import ActivityCard from "./ActivityCard";
// import { formatCurrentTime } from "@/utils/formatCurrentTime";

// interface ScheduleTimelineProps {
//     startDayHour: number;
//     endDayHour: number;
//     activities: IActivity[];
// }

// // Constants for timeline sizing
// const PIXELS_PER_MINUTE = 1.5;
// const HOUR_HEIGHT = PIXELS_PER_MINUTE * 60; // 60 minutes * pixels per minute
// const MIN_ACTIVITY_HEIGHT = 52; // Minimum height for activity cards
// const HOUR_LABEL_WIDTH = 60; // Width of the hour label column
// const TIMELINE_PADDING_TOP = 16; // Padding at the top of the timeline

// const ScheduleTimeline = ({ 
//     startDayHour, 
//     endDayHour, 
//     activities 
// }: ScheduleTimelineProps) => {
//     const [currentTime, setCurrentTime] = useState(new Date());
//     const scrollViewRef = useRef<ScrollView>(null);
    
//     // Update current time every 30 seconds
//     useEffect(() => {
//         const interval = setInterval(() => {
//             setCurrentTime(new Date());
//         }, 30000);
    
//         return () => clearInterval(interval);
//     }, []);
    
//     // Calculate total timeline height
//     const totalHours = endDayHour - startDayHour + 1;
//     const timelineHeight = totalHours * HOUR_HEIGHT;
    
//     // Calculate day start in minutes (e.g., 8:00 = 480 minutes)
//     const dayStartInMinutes = startDayHour * 60;
    
//     // Calculate current time position
//     const currentHour = currentTime.getHours();
//     const currentMinute = currentTime.getMinutes();
//     const currentTimeInMinutes = currentHour * 60 + currentMinute;
//     const currentTimeOffset = (currentTimeInMinutes - dayStartInMinutes) * PIXELS_PER_MINUTE;
    
//     // Scroll to current time on initial render
//     useEffect(() => {
//         if (scrollViewRef.current && currentHour >= startDayHour && currentHour <= endDayHour) {
//             // Scroll to current time with some offset to position it in the middle of the screen
//             const screenHeight = Dimensions.get("window").height;
//             const scrollToPosition = Math.max(0, currentTimeOffset - screenHeight / 3);
            
//             setTimeout(() => {
//                 scrollViewRef.current?.scrollTo({ y: scrollToPosition, animated: true });
//             }, 500);
//         }
//     }, []);
    
//     // Generate hour markers
//     const hourMarkers = [];
//     for (let hour = startDayHour; hour <= endDayHour; hour++) {
//         const hourOffset = (hour - startDayHour) * HOUR_HEIGHT;
//         hourMarkers.push(
//             <View key={`hour-${hour}`} style={[tw`absolute flex-row w-full`, { top: hourOffset }]}>
//                 <View style={[tw`items-center justify-start`, { width: HOUR_LABEL_WIDTH }]}>
//                     <Text style={tw`text-gray-500 font-medium`}>{hour}:00</Text>
//                 </View>
//                 <View style={tw`flex-1 border-t border-gray-200 mt-3`} />
//             </View>
//         );
//     }
    
//     // Position activities
//     const positionedActivities = activities.map(activity => {
//         // Parse activity times
//         const [startHour, startMinute] = activity.startTime.split(":").map(Number);
//         const activityStartInMinutes = startHour * 60 + startMinute;
        
//         // Calculate position and height
//         const startOffset = (activityStartInMinutes - dayStartInMinutes) * PIXELS_PER_MINUTE;
//         const activityHeight = Math.max(MIN_ACTIVITY_HEIGHT, activity.duration * PIXELS_PER_MINUTE);
        
//         return (
//             <View 
//                 key={activity.id} 
//                 style={[
//                     tw`absolute left-0 right-0 px-2`,
//                     { 
//                         top: startOffset + TIMELINE_PADDING_TOP,
//                         height: activityHeight,
//                         paddingLeft: HOUR_LABEL_WIDTH // Offset to align with timeline
//                     }
//                 ]}
//             >
//                 <ActivityCard 
//                     activity={activity} 
//                     activityHeight={activityHeight}
//                 />
//             </View>
//         );
//     });
    
//     // Current time indicator
//     const showCurrentTime = currentHour >= startDayHour && currentHour <= endDayHour;
//     const currentTimeIndicator = showCurrentTime ? (
//         <View 
//             style={[
//                 tw`absolute flex-row items-center w-full z-10`, 
//                 { top: currentTimeOffset + TIMELINE_PADDING_TOP }
//             ]}
//         >
//             <View style={[tw`items-center justify-center`, { width: HOUR_LABEL_WIDTH }]}>
//                 <Text style={tw`text-red-500 font-medium`}>{formatCurrentTime(currentTime)}</Text>
//             </View>
//             <View style={tw`flex-1 border-t border-red-500`} />
//         </View>
//     ) : null;
    
//     return (
//         <ScrollView 
//             ref={scrollViewRef}
//             style={tw`flex-1 pt-8`}
//             showsVerticalScrollIndicator={false}
//         >
//             <View 
//                 style={[
//                     tw`relative`, 
//                     { 
//                         height: timelineHeight + TIMELINE_PADDING_TOP * 2,
//                         paddingTop: TIMELINE_PADDING_TOP
//                     }
//                 ]}
//             >
//                 {/* Hour markers */}
//                 {hourMarkers}
                
//                 {/* Activities */}
//                 {positionedActivities}
                
//                 {/* Current time indicator */}
//                 {currentTimeIndicator}
//             </View>
//         </ScrollView>
//     );
// };

// export default ScheduleTimeline;