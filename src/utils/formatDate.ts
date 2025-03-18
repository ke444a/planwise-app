const getDaySuffix = (day: number): string => {
    if (day > 3 && day < 21) return "th";
    switch (day % 10) {
    case 1: return "st";
    case 2: return "nd";
    case 3: return "rd";
    default: return "th";
    }
};

export const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = date.toLocaleString("en-US", { month: "short" });
    const day = date.getDate();

    // Add appropriate suffix to the day
    const suffix = getDaySuffix(day);

    return `${year}, ${day}${suffix} ${month}`;
};
