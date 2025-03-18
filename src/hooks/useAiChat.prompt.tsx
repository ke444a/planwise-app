import { Schema } from "@react-native-firebase/vertexai";

const SYSTEM_PROMPT = "You are an AI-powered scheduling assistant. Your task is to create an optimized daily schedule for the user while ensuring a balanced workload. You will be provided with a plain-language overview of what the user wants to schedule today as well as their existing schedule and personal preferences.";

const USER_PROMPT = (userOnboardingInfo: IOnboardingInfo, userInput: string, userSchedule?: any) => {
    return `<context>
**User prefences**:
- Start of the day: ${userOnboardingInfo.startDayTime}
- End of the day: ${userOnboardingInfo.endDayTime}
- Daily stamina limit: 25
- Personality type: ${userOnboardingInfo.dayStructure}
- Must-do task categories: ${userOnboardingInfo.priorityActivities}

**User existing schedule**:
${userSchedule ? userSchedule : "Schedule is empty"}
</context>

<input>
The user has provided the following overview of what they want to do today:
${userInput}
</input>

<instructions>
Your goal is to analyze the user's input, their existing schedule, and preferences, then generate an optimized schedule that maximizes productivity while preventing burnout.
* If user did not return some specific information, make assumptions based on the user's preferences and existing schedule.
* If user did not provide any relevant information, return an empty schedule.

1. Scheduling Process
- Analyze the user's task overview and understand their intended priorities.
- Review their existing schedule and ensure your generated tasks do not overlap with fixed commitments.
- Optimize the schedule to match their preferences, ensuring high-priority tasks are scheduled first and workload is distributed efficiently.
- If a task does not fit due to time constraints or stamina limits:
   - Prioritize tasks marked as "must-do" by the user.
   - Fit as many tasks as possible without exceeding reasonable stamina limits.
   - If a task is omitted, make logical choices based on priority.

2. Time Management Rules
- Tasks must be scheduled in multiples of 15 minutes (15, 30, 45, 60).
- The schedule must respect the user's preferred start and end times.
- Tasks must not overlap with existing scheduled activities.
- Breaks should be inserted after high-effort tasks when possible.
- Time gaps should be minimized to ensure an efficient flow.

3. Stamina (Effort) Management
- Each task must have an assigned stamina cost reflecting effort required:
  - 7-10 → Intense cognitive/physical work (deep work, long meetings, workouts)
  - 4-6 → Moderate effort (brainstorming, planning, studying)
  - 2-3 → Light work (emails, admin tasks, short meetings)
  - 0-1 → No stamina cost (breaks, meditation, passive learning)
- The total stamina cost should be close to the daily limit (but may exceed slightly).
- Avoid back-to-back high-stamina tasks whenever possible.

4. Task Categories & Duration Rules
Each task must be assigned one of the following categories:
- Focus Work → Deep work, coding, writing, designing
- Collaborative Work → Meetings, calls, teamwork
- Repetitive Tasks → Routine check-ins, admin work
- Health & Fitness → Gym, yoga, running
- Meals → Breakfast, lunch, dinner, snacks
- Recreation & Recovery → Breaks, meditation, hobbies
- Education & Learning → Studying, reading, attending classes
- Life Maintenance → Errands, chores, shopping
- Miscellaneous → Tasks that don't fit other categories
- All durations must be in multiples of 15 minutes.

5. Task Priorities
- must_do → Must be completed ASAP. Top priority.
- get_it_done → Important to complete.
- nice_to_have → Could be nice to complete if time allows.
- routine → No urgency, should be completed regularly.

6. User Preferences Integration
- Align with personality type:  
  - Morning person → Prioritize complex tasks earlier.  
  - Night owl → Push deep work to later hours.  
  - Paced planner → Distribute workload evenly throughout the day.  
- Ensure must-do tasks are scheduled first.  
- Balance work and recovery by adding breaks appropriately.  
</instructions>

<output>
Your output should be a JSON object with the following structure:
{
  "schedule": [
    {
      "start_time": "09:00",
      "duration": 60,
      "end_time": "10:00",
      "title": "Work on Project",
      "category": "focus_work",
      "stamina_cost": 6,
      "priority": "must_do",
    },
    {
      "start_time": "10:00",
      "duration": 15,
      "end_time": "10:15",
      "title": "Meditation",
      "category": "recreation",
      "stamina_cost": 0,
      "priority": "routine",
    },
    {
      "start_time": "12:15",
      "duration": 45,
      "end_time": "13:00",
      "title": "Team Meeting",
      "category": "collaborative_work",
      "stamina_cost": 3,
      "priority": "get_it_done",
    }
  ]
}
</output>`;
};

const TASK_CATEGORIES = [
    "focus_work",
    "collaborative_work",
    "repetitive_tasks",
    "health_fitness",
    "food",
    "recreation",
    "education",
    "life_maintenance",
    "misc"
];

const PRIORITY_OPTIONS = [
    "must_do",
    "get_it_done",
    "nice_to_have",
    "routine"
];

const SCHEDULE_SCHEMA = Schema.object({
    properties: {
        schedule: Schema.array({
            items: Schema.object({
                properties: {
                    start_time: Schema.string({
                        description: "The start time of the task in HH:MM format"
                    }),
                    duration: Schema.number({
                        description: "The duration of the task in minutes. Must be a multiple of 15."
                    }),
                    end_time: Schema.string({
                        description: "The end time of the task in HH:MM format (start_time + duration)"
                    }),
                    title: Schema.string({
                        description: "The title of the task"
                    }),
                    category: Schema.enumString({
                        description: "The category of the task",
                        enum: TASK_CATEGORIES
                    }),
                    stamina_cost: Schema.number({
                        description: "The stamina cost of the task"
                    }),
                    priority: Schema.enumString({
                        description: "The priority of the task",
                        enum: PRIORITY_OPTIONS
                    })
                }
            }),
            description: "Array of tasks to be scheduled. If user input is not relevant to scheduling, return an empty array."
        })
    }
});

// const SCHEDULE_SCHEMA = {
//     "type": "object",
//     "properties": {
//         "schedule": {
//             "type": "array",
//             "description": "Array of tasks to be scheduled. If user input is not relevant to scheduling, return an empty array.",
//             "items": {
//                 "type": "object",
//                 "properties": {
//                     "start_time": {
//                         "type": "string",
//                         "description": "The start time of the task in HH:MM format"
//                     },
//                     "end_time": {
//                         "type": "string",
//                         "description": "The end time of the task in HH:MM format"
//                     },
//                     "title": {
//                         "type": "string",
//                         "description": "The title of the task"
//                     },
//                     "category": {
//                         "type": "string",
//                         "description": "The category of the task",
//                         "enum": TASK_CATEGORIES
//                     },
//                     "stamina_cost": {
//                         "type": "number",
//                         "description": "The stamina cost of the task"
//                     },
//                     "priority": {
//                         "type": "string",
//                         "description": "The priority of the task",
//                         "enum": PRIORITY_OPTIONS
//                     },
//                     "duration": {
//                         "type": "number",
//                         "description": "The duration of the task in minutes. Must be a multiple of 15."
//                     }
//                 },
//                 "propertyOrdering": [
//                     "start_time",
//                     "end_time",
//                     "duration",
//                     "title",
//                     "category",
//                     "priority",
//                     "stamina_cost"
//                 ]
//             }
//         }
//     }
// };


export { SYSTEM_PROMPT, USER_PROMPT, SCHEDULE_SCHEMA };