import { timeToMinutes } from "./timeToMinutes";

export const checkTimeOverlap = (
    newStartTime: string,
    newEndTime: string,
    existingActivities: IActivity[]
): IActivity | null => {
    const newStartMinutes = timeToMinutes(newStartTime);
    const newEndMinutes = timeToMinutes(newEndTime);

    // Sort activities by start time
    const sortedActivities = [...existingActivities].sort((a, b) => 
        timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
    );

    for (const activity of sortedActivities) {
        const activityStartMinutes = timeToMinutes(activity.startTime);
        const activityEndMinutes = timeToMinutes(activity.endTime);

        // Check if there's any overlap
        if (
            (newStartMinutes >= activityStartMinutes && newStartMinutes < activityEndMinutes) || // New activity starts during existing activity
            (newEndMinutes > activityStartMinutes && newEndMinutes <= activityEndMinutes) || // New activity ends during existing activity
            (newStartMinutes <= activityStartMinutes && newEndMinutes >= activityEndMinutes) // New activity completely encompasses existing activity
        ) {
            return activity;
        }
    }

    return null;
}; 