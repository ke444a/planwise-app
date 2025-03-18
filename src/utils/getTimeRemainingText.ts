import { timeToMinutes } from "./timeToMinutes";

export const getTimeRemainingText = (endTime: string): string => {
    const now = new Date();
    const currentHours = now.getHours();
    const currentMinutes = now.getMinutes();
    const currentTotalMinutes = currentHours * 60 + currentMinutes;
    
    const endTotalMinutes = timeToMinutes(endTime);
    const minutesRemaining = endTotalMinutes - currentTotalMinutes;
    
    if (minutesRemaining <= 0) {
        return "Ended";
    }
    
    if (minutesRemaining < 60) {
        return `${minutesRemaining} min remaining`;
    }
    
    const hoursRemaining = Math.floor(minutesRemaining / 60);
    const remainingMinutes = minutesRemaining % 60;
    
    if (remainingMinutes === 0) {
        return `${hoursRemaining} hr remaining`;
    }
    
    return `${hoursRemaining} hr ${remainingMinutes} min remaining`;
};