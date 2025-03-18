export const getActivityDurationLabel = (duration: number): string => {
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    if (duration < 60) {
        return `${minutes} min`;
    }

    const hourText = hours === 1 ? `${hours} hr` : `${hours} hrs`;
    const minuteText = minutes > 0 ? `${minutes} min` : "";
    return (`${hourText} ${minuteText}`).trim();
};