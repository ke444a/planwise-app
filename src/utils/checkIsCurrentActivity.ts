import { timeToMinutes } from "./timeToMinutes";

export const checkIsCurrentActivity = (startTime: string, endTime: string, activityDate: Date): boolean => {
    const now = new Date();
    const isToday = now.toDateString() === activityDate.toDateString();
    if (!isToday) return false;

    const currentHours = now.getHours();
    const currentMinutes = now.getMinutes();
    const currentTotalMinutes = currentHours * 60 + currentMinutes;

    const startTotalMinutes = timeToMinutes(startTime);
    const endTotalMinutes = timeToMinutes(endTime);
    return currentTotalMinutes >= startTotalMinutes && currentTotalMinutes < endTotalMinutes;
};