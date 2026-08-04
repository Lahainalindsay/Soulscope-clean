import { CONSTELLATION_REGISTRY } from "@soulscope/canonical-contracts";

export const visualFoundationNotice =
  "Visual foundation only. No voice analysis, scoring, state inference, or saved data is active.";

export const promptArc = [
  {
    id: "opening",
    number: "01",
    label: "Opening",
    detail: "Within-session reference",
    duration: "30 sec",
    tone: "cyan",
  },
  {
    id: "demand",
    number: "02",
    label: "Emotional demand",
    detail: "Reflective prompt",
    duration: "30 sec",
    tone: "blue",
  },
  {
    id: "future",
    number: "03",
    label: "Future orientation",
    detail: "Looking ahead",
    duration: "30 sec",
    tone: "violet",
  },
] as const;

export const constellationRows = CONSTELLATION_REGISTRY.map((entry) => ({
  id: entry.id,
  label: entry.label,
}));

export const demoSession = {
  date: "August 3, 2026",
  shortDate: "08.03.26",
  duration: "01:30",
  prompts: "3 of 3",
  reference: "Within-session demonstration",
  title: "Holding steady while looking ahead",
  lead:
    "Demonstration copy for visual review only. This statement is not derived from voice evidence.",
  question: "What part of your current pace feels worth meeting with more room?",
};

export const reflectionFacets = [
  {
    label: "Inside",
    copy:
      "Demonstration reflection: the layout allows a quieter inner-experience observation to sit close to the visual field without becoming a technical readout.",
  },
  {
    label: "With other people",
    copy:
      "Demonstration reflection: this area is reserved for relational presentation once evidence-backed story content is approved.",
  },
  {
    label: "Where you may hold back",
    copy:
      "Demonstration reflection: restrained language, visible boundaries, and open uncertainty remain part of the presentation contract.",
  },
  {
    label: "Through the day",
    copy:
      "Demonstration reflection: daily-life examples will appear here later, separated from scan mechanics and technical vocabulary.",
  },
  {
    label: "Looking forward",
    copy:
      "Demonstration reflection: future-facing content remains reflective and bounded, not a request to take another scan.",
  },
];

export const historyRows = [
  {
    date: "Aug 3, 2026",
    prompts: "3 prompts",
    title: "Holding steady while looking ahead",
    status: "Demo reflection",
  },
  {
    date: "Jul 28, 2026",
    prompts: "3 prompts",
    title: "Visual placeholder",
    status: "Not interpreted",
  },
  {
    date: "Jul 21, 2026",
    prompts: "3 prompts",
    title: "Presentation record",
    status: "Demo only",
  },
];

export const scanPrompts = {
  "1": {
    step: "1",
    category: "Opening response",
    title: "Start with what feels present right now.",
    body:
      "Speak naturally about your current moment. This opening response is a within-session reference, not a trusted longitudinal baseline.",
  },
  "2": {
    step: "2",
    category: "Emotional demand",
    title: "Reflect on something that asks more of you.",
    body:
      "Choose something real but manageable. The visual foundation shows recording controls only; it does not analyze your words or voice.",
  },
  "3": {
    step: "3",
    category: "Future orientation",
    title: "Look toward what could feel possible next.",
    body:
      "Speak toward a near future you can imagine. This screen demonstrates the prompt structure without saving audio.",
  },
} as const;
