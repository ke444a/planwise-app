import { getFirestore, collection, getDocs } from "@firebase/firestore";
import { useQuery } from "@tanstack/react-query";

interface IUserStats {
    totalCompleted: number;
    longestStreak: number;
    favoriteActivity: ActivityType | null;
    avgStaminaPerDay: number;
}

const getUserStats = async (uid?: string): Promise<IUserStats | null> => {
    if (!uid) return null;

    const db = getFirestore();
    
    // Get all dates in the schedules collection for this user
    const schedulesRef = collection(db, "schedules", uid);
    const datesSnapshot = await getDocs(schedulesRef);
    
    // Fetch activities for each date
    const activitiesPromises = datesSnapshot.docs.map(async (dateDoc) => {
        const activitiesRef = collection(db, "schedules", uid, dateDoc.id);
        const activitiesSnapshot = await getDocs(activitiesRef);
        return activitiesSnapshot.docs.map(doc => ({
            ...doc.data(),
            id: doc.id
        }) as IActivity);
    });

    const activitiesByDate = await Promise.all(activitiesPromises);
    console.log(activitiesByDate);
    const activities = activitiesByDate.flat();

    // Calculate total completed
    const totalCompleted = activities.filter(activity => activity.isCompleted).length;

    // Calculate streaks using the date documents
    const sortedDates = datesSnapshot.docs
        .map(doc => doc.id)
        .sort();
    
    let currentStreak = 0;
    let longestStreak = 0;
    
    if (sortedDates.length > 0) {
        currentStreak = 1;
        longestStreak = 1;
        
        for (let i = 1; i < sortedDates.length; i++) {
            const prevDate = new Date(sortedDates[i - 1]);
            const currDate = new Date(sortedDates[i]);
            const diffDays = Math.round((currDate.getTime() - prevDate.getTime()) / (1000 * 3600 * 24));
            
            if (diffDays === 1) {
                currentStreak++;
                longestStreak = Math.max(longestStreak, currentStreak);
            } else {
                currentStreak = 1;
            }
        }
    }

    // Calculate favorite activity
    const activityTypeCounts = activities.reduce<Record<ActivityType, number>>((counts, activity) => {
        if (activity.type) {
            counts[activity.type] = (counts[activity.type] || 0) + 1;
        }
        return counts;
    }, {} as Record<ActivityType, number>);
    
    let favoriteActivity: ActivityType | null = null;
    if (Object.keys(activityTypeCounts).length > 0) {
        favoriteActivity = Object.entries(activityTypeCounts)
            .reduce((max, [type, count]) => 
                count > (max[1] || 0) ? [type, count] : max, ["", 0])[0] as ActivityType;
    }

    // Calculate average stamina per day
    const totalStamina = activities.reduce((sum, activity) => sum + (activity.staminaCost || 0), 0);
    const avgStaminaPerDay = sortedDates.length > 0 
        ? Math.round(totalStamina / sortedDates.length) 
        : 0;

    return {
        totalCompleted,
        longestStreak,
        favoriteActivity,
        avgStaminaPerDay
    };
};

export const useGetUserStatsQuery = (uid?: string) => {
    return useQuery({
        queryKey: ["userStats", uid],
        queryFn: () => getUserStats(uid),
        enabled: !!uid
    });
};
