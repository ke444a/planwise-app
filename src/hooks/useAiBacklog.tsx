import { useAppContext } from "@/context/AppContext";
import { getApp } from "@react-native-firebase/app";
import { getVertexAI, getGenerativeModel, Schema } from "@react-native-firebase/vertexai";
import { useCallback, useState } from "react";

export const useAiBacklog = () => {
    const [messages, setMessages] = useState<IChatMessage[]>([]);
    const { setError } = useAppContext();

    const addMessage = useCallback((msg: IChatMessage) => {
        setMessages(prev => {
            const updatedMessages = [...prev, msg];
            const sortedMessages = updatedMessages.sort((a, b) => a.timestamp - b.timestamp);
            return sortedMessages;
        });
    }, [setMessages]);

    const generateBacklogItems = useCallback(async (userInput: string, timestamp: number) => {
        try {
            const app = getApp();
            const vertexai = getVertexAI(app, {
                location: "europe-west1"
            });
            const model = getGenerativeModel(vertexai, {
                model: "gemini-2.0-flash-001",
                systemInstruction: SystemPrompt
            });

            // Exclude user's message that was sent a second ago (timestamp - 1) (if exists)
            // Sort messages by timestamp
            const history = messages
                .filter(msg => msg.role !== "user" || msg.timestamp !== timestamp - 1)
                .map(msg => ({
                    role: msg.role as "user" | "model",
                    parts: [{ text: typeof msg.content === "string" ? msg.content : JSON.stringify(msg.content) }]
                }));
            history[0] = {
                role: "user",
                parts: [{ text: UserPrompt(userInput) }]
            };
            const chat = model.startChat({
                history,
                generationConfig: {
                    temperature: 0.3,
                    responseMimeType: "application/json",
                    responseSchema: BacklogItemsSchema
                }
            });
            const { response } = await chat.sendMessage([userInput]);
            addMessage({ role: "model", content: response.text(), timestamp });
        } catch (error) {
            console.log(error);
            setError({
                message: "Failed to generate backlog items",
                code: "ai-chat-failed",
                error
            });
            return "";
        }
    }, [addMessage, setError, messages]);

    return {
        messages,
        generateBacklogItems,
        addMessage
    };
};

const SystemPrompt = "You are an AI assistant that helps users create structured tasks. Based on the user's natural language input, your job is to extract task titles, estimate durations, and include any possible subtasks.";

const UserPrompt = (userInput: string) => `
<user_input>
${userInput}
</user_input>

<instructions>
- Extract all meaningful tasks from the user's input
- For each task, include:
  * title: a short, clear label for the task
  * estimated_duration: time in minutes (15 minutes minimum)
  * subtasks: array of subtask titles
- Do not create subtasks unless the user suggests a breakdown or sequence.
- Leave subtasks empty if there are no subtasks.
- Keep all task titles and subtasks concise and focused.
- Always return an empty array if user input does not contain any tasks.
</instructions>

<output_format>
Return your response as a JSON array of tasks.
[
  {
    "title": "Organize photo library",
    "estimated_duration": 60
  },
  {
    "title": "Prepare blog post",
    "estimated_duration": 90,
    "subtasks": [
      "Outline key points",
      "Write first draft",
      "Edit and finalize"
    ]
  }
]
</output_format>
`.trim();

const BacklogItemsSchema = Schema.array({
    items: Schema.object({
        properties: {
            title: Schema.string({
                description: "The title of the task"
            }),
            estimated_duration: Schema.number({
                description: "The estimated duration of the task in minutes (15 minutes minimum)"
            }),
            subtasks: Schema.array({
                items: Schema.string({
                    description: "The subtask title"
                })
            })
        },
        optionalProperties: ["subtasks"]
    })
});