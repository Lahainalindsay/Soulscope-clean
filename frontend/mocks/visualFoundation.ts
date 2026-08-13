import { CONSTELLATION_REGISTRY } from "@soulscope/canonical-contracts";

export const promptArc = [
  {
    id: "opening",
    number: "01",
    label: "Opening",
    detail: "Starting point",
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

export const historyRows = [
  {
    date: "Aug 3, 2026",
    prompts: "3 prompts",
    title: "Holding steady while looking ahead",
    status: "Sample reflection",
  },
  {
    date: "Jul 28, 2026",
    prompts: "3 prompts",
    title: "Sample session",
    status: "Not saved",
  },
  {
    date: "Jul 21, 2026",
    prompts: "3 prompts",
    title: "Quiet after a busy week",
    status: "Sample only",
  },
];

export const scanPrompts = {
  "1": {
    step: "1",
    category: "1 of 3",
    title: "Please tell me something about yourself or your life, anything that comes to mind.",
    body: "When you begin, respond naturally for the full guided measurement period.",
  },
  "2": {
    step: "2",
    category: "2 of 3",
    title: "Tell me about something that has been asking more of you lately.",
    body: "Respond naturally while SoulScope completes the guided measurement period.",
  },
  "3": {
    step: "3",
    category: "3 of 3",
    title: "Tell me what could feel possible from here.",
    body: "Speak toward a near future you can imagine for the guided measurement period.",
  },
} as const;
