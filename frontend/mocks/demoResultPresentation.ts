// This fixture is for layout and visual review only.
// It is not generated from voice evidence.
// It must not be used as a production result.

export const demoResultPresentation = {
  warning: "This fixture is for layout and visual review only. It is not generated from voice evidence.",
  date: "August 3, 2026",
  duration: "Three prompts completed",
  referenceType: "Within-session demonstration",
  headline: "Holding steady while looking ahead",
  lead:
    "Your responses remained deliberate through the emotionally demanding prompt, while the future-oriented prompt appeared to create more room for forward movement. This is demonstration copy for visual review, not a voice-derived conclusion.",
  facets: [
    {
      title: "Inside",
      label: "Demonstration reflection",
      body: "There is a quiet sense of staying with the moment without rushing to resolve it. In production, this space would only contain supported reflection content.",
    },
    {
      title: "With other people",
      label: "Demonstration reflection",
      body: "The layout allows room for relational context without turning it into a claim about intent, attachment, or hidden feelings.",
    },
    {
      title: "Where you may hold back",
      label: "Demonstration reflection",
      body: "This section is designed for careful, bounded language. It cannot imply suppression, deception, or a truth the person has not named.",
    },
    {
      title: "Through the day",
      label: "Demonstration reflection",
      body: "Daily-life examples should stay concrete and modest, describing possible situations rather than measured traits.",
    },
    {
      title: "Looking forward",
      label: "Demonstration reflection",
      body: "Future access can be presented as a reflection area, not proof of hope or recovery.",
    },
  ],
  reflectionQuestion: "What would make the next hour feel a little more spacious?",
} as const;

export const demoSessions = [
  { id: "demo-001", date: "August 3, 2026", status: "3 prompts completed" },
  { id: "demo-000", date: "Presentation fixture", status: "Visual placeholder" },
] as const;

export const promptPresentation = [
  {
    id: "1",
    category: "Opening response",
    prompt: "Start with what feels present right now. You can speak plainly, slowly, or with pauses.",
  },
  {
    id: "2",
    category: "Emotionally demanding reflection",
    prompt: "Speak about something that has asked more of you lately, without needing to solve it.",
  },
  {
    id: "3",
    category: "Future-oriented reflection",
    prompt: "Look toward the next part of your day and describe what would help you move with steadiness.",
  },
] as const;
