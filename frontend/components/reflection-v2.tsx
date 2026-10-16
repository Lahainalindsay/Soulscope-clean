"use client";
import { useState } from "react";
import { getSupabase } from "../lib/supabase";
import type { ReflectionV2 } from "../lib/reflection-v2";

const chapters = [
  ["overview", "THE FEEL OF THIS MOMENT"], ["cognition", "HOW YOUR MIND IS MOVING"],
  ["relationships", "WITH OTHER PEOPLE"], ["expression", "WHAT YOU PUT INTO THE WORLD"],
  ["question", "A QUESTION TO SIT WITH"],
] as const;
export function TranscriptReflection({ reading }: { reading: ReflectionV2 }) {
  const [rating, setRating] = useState<"accurate" | "partly" | "missed_me" | null>(null);
  const [error, setError] = useState("");
  async function rate(value: "accurate" | "partly" | "missed_me") {
    const db = getSupabase();
    if (!db) { setError("Sign in to rate this reading."); return; }
    const { data } = await db.auth.getUser();
    if (!data.user) { setError("Sign in to rate this reading."); return; }
    const { error: saveError } = await db.from("reflection_feedback_v2").upsert({
      reflection_id: reading.reflectionId, user_id: data.user.id, rating: value,
    }, { onConflict: "reflection_id,user_id" });
    if (saveError) setError("Your rating could not be saved. Please try again.");
    else { setRating(value); setError(""); }
  }
  return <>
    <p className="preview-notice">An interpretation of what you said in this scan. Only the words you spoke support this reading; it may miss what you meant.</p>
    {chapters.map(([name, title]) => reading.sections[name].length ? <section className="panel personal-reading-section" key={name}>
      <p className="eyebrow">{title}</p>
      {reading.sections[name].map((line, i) => <p key={i}>{line.text}</p>)}
    </section> : null)}
    <section className="panel reading-feedback" aria-label="Reading feedback">
      <p className="eyebrow">DID THIS FEEL LIKE YOU?</p>
      <div className="reading-options">{([ ["accurate", "Accurate"], ["partly", "Partly"], ["missed_me", "Missed me"] ] as const)
        .map(([value, label]) => <button type="button" key={value} aria-pressed={rating === value}
          onClick={() => void rate(value)}>{label}</button>)}</div>
      {rating && <p role="status">Thank you. Your feedback was saved.</p>}
      {error && <p role="alert">{error}</p>}
    </section>
  </>;
}
