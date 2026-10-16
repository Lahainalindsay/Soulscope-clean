/** Editorial examples only. These stories have no source scan, scores or publication status. */
export type PersonalReadingDemo = Readonly<{
  id: string; label: string; title: string; overall: string;
  cognitive: string; relationships: string; outward: string;
  dailyLife: readonly [string, string, string]; reflection: string;
}>;

export const PERSONAL_READING_DEMOS: readonly PersonalReadingDemo[] = Object.freeze([
  {
    id: "open", label: "Room to move", title: "There is room to move.",
    overall: "You have room around you right now. The past is present without taking over the whole picture, and what comes next feels inviting. There is a quiet balance beneath your excitement: you can move forward without needing to rush.",
    cognitive: "Your mind is making space for possibility. You can begin a plan before every detail is certain. What might feel like restlessness could also be readiness: an idea wants a little room to become real.",
    relationships: "You may find it easier to let someone close to what excites you. There is less need to have the perfect explanation first. Sharing a half-formed hope might feel more connecting than keeping it polished and private.",
    outward: "Your words can come more freely when you talk about what is ahead. That openness may give other people permission to meet you with their own ideas, instead of waiting for you to have all the answers.",
    dailyLife: ["Making a plan for something that matters to you.", "Speaking freely about what excites you.", "Trying an idea before you know exactly where it will lead."],
    reflection: "You do not have to turn this openness into productivity. Take a breath and enjoy it. Notice what feels possible right now, and let that be enough for a moment.",
  },
  {
    id: "many-threads", label: "Many threads", title: "You are holding several threads.",
    overall: "There is movement in this moment, but it asks something of you. Part of your attention is already looking ahead while another part is still with what is happening now. It may be a time to choose what deserves your energy, rather than asking yourself to carry everything at once.",
    cognitive: "Your mind may be keeping several questions open. That can help you see connections, but it can also make one decision feel larger than it is. One clear next step may be more useful than a complete plan.",
    relationships: "You may want someone close without wanting one more person to answer to. Being heard without having to make the whole situation tidy could feel especially welcome.",
    outward: "You may be choosing your words carefully, even when you have plenty to say. The space before a reply can give you time to decide which part is yours to speak about now.",
    dailyLife: ["Finishing one task while the next is already on your mind.", "Wanting company without needing advice.", "Taking a breath before answering a question that matters."],
    reflection: "You do not need to resolve every open thread today. Choose one thing that can wait, one thing that needs care, and give yourself permission to leave the rest unfinished for now.",
  },
  {
    id: "quiet", label: "Quiet clarity", title: "A quieter kind of clarity.",
    overall: "This moment has a more inward pace. You may not be reaching for the next big move, and that does not make the moment empty. There can be clarity in giving yourself enough room to hear what still matters when everything is less loud.",
    cognitive: "Thoughts may be arriving more slowly and with less urgency. Instead of forcing an answer, you might be noticing which questions continue to return.",
    relationships: "Connection may feel best when it is simple: an honest conversation, familiar company, or the freedom to be quiet with someone who understands.",
    outward: "You do not need to fill every pause. A few well-chosen words may express more than a long explanation, especially when you are still finding the shape of what you mean.",
    dailyLife: ["Letting a conversation take its time.", "Choosing a smaller plan that actually feels right.", "Noticing which thought remains when the day gets quiet."],
    reflection: "Give this moment a little room before deciding what it means. Breathe. Notice what is here without asking it to become something else immediately.",
  },
]);
