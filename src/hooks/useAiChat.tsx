import { getApp } from "@react-native-firebase/app";
import { getVertexAI, getGenerativeModel, Schema } from "@react-native-firebase/vertexai";
import { useCallback, useState } from "react";
import { getFunctions, httpsCallable } from "@react-native-firebase/functions";
import { ACTIVITY_TYPES } from "@/libs/constants";

export const useAiChat = () => {
    const [messages, setMessages] = useState<IChatMessage[]>([]);
    const [isGeneratingSchedule, setIsGeneratingSchedule] = useState(false);

    const addMessage = useCallback((msg: IChatMessage) => {
        setMessages(prev => {
            const updatedMessages = [...prev, msg];
            const sortedMessages = updatedMessages.sort((a, b) => a.timestamp - b.timestamp);
            return sortedMessages;
        });
    }, [setMessages]);

    const genereteScheduleViaCloudFunction = useCallback(async (userInput: string, timestamp: number) => {
        try {
            setIsGeneratingSchedule(true);
            const functions = getFunctions();
            const generateSchedule = httpsCallable(functions, "generateSchedule");
            const { data } = await generateSchedule({ 
                userInput,
                date: new Date(timestamp).toISOString().split("T")[0]
            });
            addMessage({ role: "model", content: JSON.stringify((data as { schedule: IActivity[] }).schedule), timestamp });
        } catch (error) {
            console.error("Error generating schedule", error);
            addMessage({ role: "model", content: "Oops, something went wrong. Please try again.", timestamp });
        } finally {
            setIsGeneratingSchedule(false);
        }
    }, [addMessage]);


    const generateFollowUpSchedule = useCallback(async (userInput: string, timestamp: number) => {
        try {
            setIsGeneratingSchedule(true);
            const app = getApp();
            const vertexai = getVertexAI(app, {
                location: "europe-west1"
            });
            const model = getGenerativeModel(vertexai, {
                model: "gemini-2.0-flash-001",
                systemInstruction: systemPrompt
            });

            // ignore first 2 messages
            const history = messages
                .slice(2)
                .map(msg => ({
                    role: msg.role as "user" | "model",
                    parts: [{ text: msg.content }]
                }));
            history[0] = {
                role: "user",
                parts: [{ text: userPrompt(JSON.stringify(messages[1].content), userInput) }]
            };

            const chat = model.startChat({
                history,
                generationConfig: {
                    temperature: 0.3,
                    responseMimeType: "application/json",
                    responseSchema: ActivitySchema
                }
            });
            const { response } = await chat.sendMessage([userInput]);
            addMessage({ role: "model", content: response.text(), timestamp });
        } catch (error) {
            console.log(error);
            addMessage({ role: "model", content: "Oops, something went wrong. Please try again.", timestamp });
        } finally {
            setIsGeneratingSchedule(false);
        }
    }, [addMessage, messages]);

    
    const generateSchedule = useCallback(async (userInput: string, timestamp: number) => {
        // Exclude user's message that was sent a second ago (timestamp - 1) (if exists)
        // Sort messages by timestamp
        const history = messages
            .filter(msg => msg.role !== "user" || msg.timestamp !== timestamp - 1)
            .map(msg => ({
                role: msg.role as "user" | "model",
                parts: [{ text: msg.content }]
            }));
            
        if (history.length === 0) {
            await genereteScheduleViaCloudFunction(userInput, timestamp);
        } else {
            await generateFollowUpSchedule(userInput, timestamp);
        }
    }, [messages, generateFollowUpSchedule, genereteScheduleViaCloudFunction]);

    return {
        messages,
        generateSchedule,
        addMessage,
        isGeneratingSchedule
    };
};

const systemPrompt = "You are a professional scheduling assistant. You are adept at interpreting a wide range of user feedback, from simple time adjustments to more complex rescheduling requests. The user is provided with their personalized schedule that they want to make changes on. Your job is to adjust the *existing* schedule based on their feedback, performing scheduling adjustments in a stateful manner.";

const userPrompt = (schedule: string, feedback: string) => `<context>
Schedule represents a list of tasks that the user wants to complete on a given day. The schedule is provided in JSON format.

Each task has the following properties:
- title: Title of the task (string)
- startTime: Start time of the task (string in HH:MM format, e.g., "09:00")
- endTime: End time of the task (string in HH:MM format, e.g., "10:00")
- duration: Duration of the task in minutes (integer)
- priority: Priority of the task from <task_priority>
- type: Type of the task from <task_type>
</context>

<task_type>
- focus_work: Deep thinking or concentration-heavy tasks (e.g., coding, writing, designing)
- collaborative_work: Work involving interaction with other people (e.g., meetings, calls, group sessions)
- repetitive_tasks: Routine or maintenance work (e.g., cleaning inbox, updating spreadsheets)
- health_fitness: Physical exercise or wellness activities (e.g., gym, yoga, walking)
- food: Meal preparation or eating (e.g., lunch, cooking dinner)
- recreation: Activities for relaxtion and enjoyment (e.g., hobbies, breaks, meditation)
- education: Learning or studying activities (e.g., watching a course, reading a book)
- life_maintenance: Errands or household upkeep (e.g., laundry, grocery shopping)
- misc: Anything that doesn't clearly fit another category
</task_type>

<task_priority>
- must_do: Critical tasks that must be included
- get_it_done: Important tasks that should be included
- nice_to_have: Optional tasks; lower priority
- routine: Habitual or low-urgency tasks
</task_priority>

<instructions>
To make changes to the schedule, follow these steps:
1. Carefully review the existing schedule
2. Make the necessary changes to the schedule based on the user's feedback
3. Apply changes according to the following guidelines:
    - Time Adjustments: If the user says "Move X to 10 AM", adjust the startTime and endTime of task X accordingly, ensuring the duration remains the same.
    - Priority Changes: If the user says "Make X higher priority", adjust the priority field to a higher level.
    - Duration Changes: If the user asks to change the duration, adjust the duration field and the endTime accordingly, keeping startTime constant.
    - Cancellations: If the user says "Cancel task X", remove X from the schedule.
    - New Tasks: If the user asks to add a task to the existing schedule, create a new task and include it in the JSON output. Ensure you create all the needed properties based on the existing JSON schema.
4. Return the updated schedule in JSON format as array of tasks representing the updated schedule
</instructions>

<constraints>
- Make only the necessary changes - do not try to create a new schedule from scratch
- Perform only the changes requested by the user
</constraints>

<input>
Schedule:
${schedule}

User's feedback:
${feedback}
</input>`;

const ActivitySchema = Schema.array({
    items: Schema.object({
        properties: {
            title: Schema.string({
                description: "The title of the task"
            }),
            startTime: Schema.string({
                description: "The start time of the task in HH:MM format"
            }),
            endTime: Schema.string({
                description: "The end time of the task in HH:MM format"
            }),
            duration: Schema.number({
                description: "The duration of the task in minutes"
            }),
            staminaCost: Schema.number({
                description: "The stamina cost of the task"
            }),
            priority: Schema.string({
                description: "The priority of the task",
                enum: ["must_do", "get_it_done", "nice_to_have", "routine"]
            }),
            type: Schema.string({
                description: "The type of the task",
                enum: ACTIVITY_TYPES
            })
        },
    })
});