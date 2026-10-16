"use client";
import { useState } from "react";
import { PERSONAL_READING_DEMOS } from "../lib/personal-reading-demo";

/** Public editorial preview. No sample is selected from a recording or used by saved results. */
export function PersonalReadingPreview() {
  const [selected, setSelected] = useState(PERSONAL_READING_DEMOS[0]);
  return <>
    <div className="reading-switcher" aria-label="Illustrative readings">
      <p className="eyebrow">EXPLORE THREE EXAMPLE MOMENTS</p>
      <div className="reading-options">{PERSONAL_READING_DEMOS.map(reading =>
        <button key={reading.id} type="button" aria-pressed={selected.id === reading.id}
          onClick={() => setSelected(reading)}>{reading.label}</button>)}</div>
    </div>
    <section className="panel personal-overall" aria-label="Overall reading">
      <p className="eyebrow">THE FEEL OF THIS MOMENT</p>
      <h2>{selected.title}</h2>
      <p>{selected.overall}</p>
    </section>
    <section className="section personal-domains" aria-label="How this moment moves through you">
      <p className="eyebrow">A CLOSER LOOK</p>
      <h2>What may be taking <em>shape.</em></h2>
      <div className="personal-domain-grid">
        <article className="panel"><span>01 / INNER WORLD</span><h3>How your mind is moving</h3><p>{selected.cognitive}</p></article>
        <article className="panel"><span>02 / CONNECTION</span><h3>With other people</h3><p>{selected.relationships}</p></article>
        <article className="panel"><span>03 / EXPRESSION</span><h3>What you put into the world</h3><p>{selected.outward}</p></article>
      </div>
    </section>
    <section className="section daily-section personal-daily">
      <p className="eyebrow">HOW THIS MAY SHOW UP</p>
      <h2>In the ordinary <em>moments.</em></h2>
      <div className="daily-grid">{selected.dailyLife.map((line, i) =>
        <article className="panel" key={line}><span className="daily-number">0{i + 1}</span><p>{line}</p></article>)}</div>
    </section>
    <section className="panel personal-reflection">
      <p className="eyebrow">A REFLECTION FOR TODAY</p>
      <p>{selected.reflection}</p>
    </section>
    <p className="personal-preview-note">These are fictional examples of the writing direction. The current scan cannot yet produce a validated personal interpretation in these areas.</p>
  </>;
}
