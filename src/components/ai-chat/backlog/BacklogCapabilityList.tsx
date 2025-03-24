import AiCapabilityList from "../AiCapabilityList";

const BACKLOG_AI_CAPABILITIES = [
    {
        title: "Drop your thoughts in plain language — I'll turn them into structured tasks for your backlog.",
        example: "I should clean out the garage sometime and maybe finally update my resume.",
        index: 0
    },
    {
        title: "I'll break tasks down, estimate how long they'll take, and even suggest subtasks when it makes sense.",
        example: "Organize the office, plan weekend trip, write blog post about Berlin.",
        index: 1
    }
];

const BacklogCapabilityList = () => {
    return <AiCapabilityList capabilities={BACKLOG_AI_CAPABILITIES} />;
};

export default BacklogCapabilityList;