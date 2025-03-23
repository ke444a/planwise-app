import { useRef, useMemo } from "react";
import { View, ScrollView } from "react-native";
import tw from "twrnc";
import ActivityCard from "./ActivityCard";
import { timeToMinutes } from "@/utils/timeToMinutes";

interface ScheduleTimelineProps {
  startDayHour: number;
  endDayHour: number;
  activities: IActivity[];
  scheduleDate: Date;
  onActivityComplete?: (_activity: IActivity) => void;
  onActivityDelete?: (_activity: IActivity) => void;
  onActivityEdit?: (_activity: IActivity) => void;
  onActivityMoveToBacklog?: (_activity: IActivity) => void;
}

// Constants
const ACTIVITY_CARD_HEIGHT = 90;
const PIXELS_PER_DURATION_MIN = 1.5;
const PIXELS_PER_GAP_MIN = 0.9;
const DEFAULT_ACTIVITY_GAP = 16;
const MAX_ACTIVITY_GAP = 200;
const MIN_ACTIVITY_ICON_HEIGHT = 52;

// Calculate the display height for an activity’s icon
const getActivityHeight = (activity: IActivity) => {
    // Start with a minimum, and add some proportional height for durations > 15 min
    return Math.max(
        MIN_ACTIVITY_ICON_HEIGHT + (activity.duration - 15) * PIXELS_PER_DURATION_MIN,
        MIN_ACTIVITY_ICON_HEIGHT
    );
};

// Calculate the display gap (in pixels) between two activities
const getGapBetweenActivities = (activity1: IActivity, activity2: IActivity) => {
    const activity1EndMinutes = timeToMinutes(activity1.endTime);
    const activity2StartMinutes = timeToMinutes(activity2.startTime);
    const minutesBetween = activity2StartMinutes - activity1EndMinutes;

    // If they're almost back-to-back (<= 15 minutes), use default gap
    if (minutesBetween <= 15) {
        return DEFAULT_ACTIVITY_GAP;
    }
    // Otherwise, scale but clamp to MAX_ACTIVITY_GAP
    return Math.min(minutesBetween * PIXELS_PER_GAP_MIN, MAX_ACTIVITY_GAP);
};

// Identify if an activity is in the past
const isActivityInPast = (activity: IActivity, scheduleDate: Date) => {
    const now = new Date();
    const isSameDay = now.toDateString() === scheduleDate.toDateString();

    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimeInMinutes = currentHour * 60 + currentMinute;

    const activityEndMinutes = timeToMinutes(activity.endTime);

    return isSameDay && currentTimeInMinutes > activityEndMinutes;
};

interface TimelineSegment {
  type: "activity" | "gap";
  startMin: number;      // start time in minutes from midnight
  endMin: number;        // end time in minutes from midnight
  displayStart: number;  // starting pixel offset on the timeline
  displayEnd: number;    // ending pixel offset on the timeline
  activity?: IActivity;  // present if type = "activity"
}

/**
 * Build an array of segments (activities and gaps), each with a time range and a display range.
 * Large gaps get collapsed to a smaller or maximum height. Activities get a height
 * based on duration.
 */
function buildSegments(activities: IActivity[]): TimelineSegment[] {
    if (!activities || activities.length === 0) {
        return [];
    }

    // Sort activities by startTime if not already
    const sorted = [...activities].sort((a, b) =>
        timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
    );

    const segments: TimelineSegment[] = [];
    let currentDisplayOffset = 0;

    for (let i = 0; i < sorted.length; i++) {
        const act = sorted[i];
        const startMin = timeToMinutes(act.startTime);
        const endMin = timeToMinutes(act.endTime);
        const activityHeight = getActivityHeight(act);

        // Create the activity segment
        const activitySegment: TimelineSegment = {
            type: "activity",
            startMin,
            endMin,
            displayStart: currentDisplayOffset,
            displayEnd: currentDisplayOffset + activityHeight,
            activity: act
        };
        segments.push(activitySegment);

        // Move the display offset
        currentDisplayOffset += activityHeight;

        // If there is a next activity, create a gap segment
        if (i < sorted.length - 1) {
            const nextAct = sorted[i + 1];
            const gapStartMin = endMin;
            const gapEndMin = timeToMinutes(nextAct.startTime);

            // Only create a gap if the next activity starts after this one ends
            if (gapEndMin >= gapStartMin) {
                const gapHeight = getGapBetweenActivities(act, nextAct);
                const gapSegment: TimelineSegment = {
                    type: "gap",
                    startMin: gapStartMin,
                    endMin: gapEndMin,
                    displayStart: currentDisplayOffset,
                    displayEnd: currentDisplayOffset + gapHeight
                };
                segments.push(gapSegment);

                // Advance the display offset
                currentDisplayOffset += gapHeight;
            }
        }
    }

    return segments;
}

/**
 * Given the segments array, find where the current time falls
 * and interpolate the display position (pixel offset).
 */
function getElapsedTimePosition(
    segments: TimelineSegment[],
    startDayHour: number,
    endDayHour: number
): number | null {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimeInMinutes = currentHour * 60 + currentMinute;

    // If out of the schedule’s range, return null
    if (currentHour < startDayHour || currentHour >= endDayHour) {
        return null;
    }
    if (!segments.length) {
        return null;
    }

    // Check if before the first segment
    if (currentTimeInMinutes < segments[0].startMin) {
        return 0;
    }

    // Check if after the last segment
    const lastSegment = segments[segments.length - 1];
    if (currentTimeInMinutes >= lastSegment.endMin) {
        return lastSegment.displayEnd;
    }

    // Otherwise, find the segment that contains the current time
    for (let i = 0; i < segments.length; i++) {
        const seg = segments[i];
        if (currentTimeInMinutes >= seg.startMin && currentTimeInMinutes < seg.endMin) {
            // Interpolate within this segment
            const segDuration = seg.endMin - seg.startMin;
            const segDisplaySize = seg.displayEnd - seg.displayStart;
            const elapsedInSegment = currentTimeInMinutes - seg.startMin;

            // fraction of the way through this segment’s time range
            const fraction = segDuration > 0 ? elapsedInSegment / segDuration : 0;

            return seg.displayStart + fraction * segDisplaySize;
        }
    }

    // Fallback if none matched (should not happen if everything is correct):
    return null;
}

const ScheduleTimeline = ({
    startDayHour,
    endDayHour,
    activities,
    scheduleDate,
    onActivityComplete = () => {},
    onActivityDelete = () => {},
    onActivityEdit = () => {},
    onActivityMoveToBacklog = () => {}
}: ScheduleTimelineProps) => {
    // const [currentTime, setCurrentTime] = useState(new Date());
    const scrollViewRef = useRef<ScrollView>(null);
    const isSameDay = useMemo(() => {
        const now = new Date();
        return now.toDateString() === scheduleDate.toDateString();
    }, [scheduleDate]);

    // Update currentTime every 30s
    // useEffect(() => {
    //     const interval = setInterval(() => {
    //         setCurrentTime(new Date());
    //     }, 30000);
    //     return () => clearInterval(interval);
    // }, []);

    // Build the segments for this schedule
    const segments = useMemo(() => buildSegments(activities), [activities]);

    // Compute the elapsed time line position
    const elapsedPosition = useMemo(() => {
        return getElapsedTimePosition(segments, startDayHour, endDayHour);
    }, [segments, startDayHour, endDayHour]);

    // Scroll to the closest activity whenever currentTime changes (if desired)
    // useEffect(() => {
    //     if (
    //         scrollViewRef.current &&
    //   currentTime.getHours() >= startDayHour &&
    //   currentTime.getHours() <= endDayHour &&
    //   activities.length > 0
    //     ) {
    //         // Find the closest activity to the current time
    //         const currentTimeInMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
    //         let closestActivityIndex = 0;
    //         let minTimeDiff = Infinity;

    //         activities.forEach((activity, index) => {
    //             const activityStartMinutes = timeToMinutes(activity.startTime);
    //             const timeDiff = Math.abs(activityStartMinutes - currentTimeInMinutes);
    //             if (timeDiff < minTimeDiff) {
    //                 minTimeDiff = timeDiff;
    //                 closestActivityIndex = index;
    //             }
    //         });

    //         // After a short delay, scroll to that activity
    //         setTimeout(() => {
    //             if (scrollViewRef.current && segments.length > 0) {
    //                 const screenHeight = Dimensions.get("window").height;
    //                 let scrollPosition = 0;

    //                 // Find which segment corresponds to the “closest” activity
    //                 const closestAct = activities[closestActivityIndex];
    //                 const segIndex = segments.findIndex(
    //                     (s) => s.type === "activity" && s.activity === closestAct
    //                 );

    //                 if (segIndex >= 0) {
    //                     // Sum the display height of all segments before that
    //                     scrollPosition = segments[segIndex].displayStart;
    //                     // Adjust so the activity is near the upper third of the screen
    //                     scrollPosition = Math.max(0, scrollPosition - screenHeight / 3);
    //                 }

    //                 scrollViewRef.current.scrollTo({ y: scrollPosition, animated: true });
    //             }
    //         }, 500);
    //     }
    // }, [currentTime, activities, segments, startDayHour, endDayHour]);

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

                    {/* Purple elapsed timeline line */}
                    {isSameDay && elapsedPosition !== null && (
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

                    {/* Render each segment (activities and gaps) */}
                    {segments.map((segment, index) => {
                        if (segment.type === "activity" && segment.activity) {
                            // For an activity segment, show the card
                            const activity = segment.activity;
                            const isPastActivity = isActivityInPast(activity, scheduleDate);
                            const iconHeight = getActivityHeight(activity);

                            return (
                                <View key={`activity-${index}`}>
                                    <ActivityCard
                                        activity={activity}
                                        iconHeight={iconHeight}
                                        containerHeight={ACTIVITY_CARD_HEIGHT}
                                        activityDate={scheduleDate}
                                        onActivityComplete={onActivityComplete}
                                        onActivityDelete={onActivityDelete}
                                        onActivityEdit={onActivityEdit}
                                        onActivityMoveToBacklog={onActivityMoveToBacklog}
                                        isPast={isPastActivity}
                                    />
                                </View>
                            );
                        } else {
                            // For a gap segment, just render an empty space
                            const gapHeight = segment.displayEnd - segment.displayStart;
                            return (
                                <View
                                    key={`gap-${index}`}
                                    style={{ height: gapHeight }}
                                />
                            );
                        }
                    })}
                </View>
            </View>
        </ScrollView>
    );
};

export default ScheduleTimeline;