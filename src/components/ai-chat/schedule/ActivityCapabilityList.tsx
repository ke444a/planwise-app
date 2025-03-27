import AiCapabilityList from "../AiCapabilityList";

const ACTIVITY_AI_CAPABILITIES = [
    {
        title: "I'll turn your plans into an optimized schedule based on your preferences and energy levels.",
        example: "I have a team call at 10, gym in the evening, and want to study after dinner.",
        index: 0
    },
    {
        title: "You can tweak your schedule anytime - move tasks, add new ones, or send them to your backlog.",
        example: "Push my workout to 7 PM, and I also want to add a call with John at 8PM.",
        index: 1
    }
];

const ActivityCapabilityList = () => {
    return <AiCapabilityList capabilities={ACTIVITY_AI_CAPABILITIES} />;
};

export default ActivityCapabilityList;