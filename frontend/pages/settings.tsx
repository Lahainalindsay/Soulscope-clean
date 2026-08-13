import { InstrumentLayout } from "../components/instrument/InstrumentLayout";

const settings = [
  {
    title: "Recording and privacy",
    rows: [
      ["Microphone", "Not accessed in this visual build", "No browser prompt"],
      ["Recordings", "Preview controls only", "No audio captured"],
      ["Discard", "Resets the visual preview state", "No stored audio"],
    ],
  },
  {
    title: "Session behavior",
    rows: [
      ["Leaving a prompt", "No microphone session is active", "Visual only"],
      ["Saved history", "Not active in this build", "Nothing is stored"],
      ["Account settings", "Not available yet", "No account connected"],
    ],
  },
  {
    title: "SoulScope boundary",
    rows: [
      ["Purpose", "Private reflection", "Not medical advice"],
      ["Not provided", "Diagnosis, scoring, or hidden-trait detection", "User boundary"],
    ],
  },
];

export default function SettingsPage() {
  return (
    <InstrumentLayout
      title="SoulScope — Settings"
      description="SoulScope recording privacy and session settings"
      eyebrow="Settings"
      heading="Recording, privacy, and boundaries"
      meta={["Local session", "You control recording"]}
    >
      <section className="ss-settings-stack" aria-label="Settings">
        {settings.map((section) => (
          <section className="ss-settings-section" key={section.title}>
            <h2>{section.title}</h2>
            {section.rows.map(([label, value, note]) => (
              <div className="ss-setting-row" key={label}>
                <span>{label}</span>
                <strong>{value}</strong>
                <small>{note}</small>
              </div>
            ))}
          </section>
        ))}
      </section>
    </InstrumentLayout>
  );
}
