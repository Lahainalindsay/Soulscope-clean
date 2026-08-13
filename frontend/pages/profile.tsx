import { InstrumentLayout } from "../components/instrument/InstrumentLayout";

const sections = [
  {
    title: "About you",
    rows: [
      ["Name", "Not set"],
      ["Reflection history", "Not saved in this build"],
      ["Personal baseline", "Not created"],
    ],
  },
  {
    title: "Privacy and recording",
    rows: [
      ["Microphone", "Not accessed in this visual build"],
      ["Recordings", "Preview controls only"],
      ["Uploads", "Not used in this build"],
    ],
  },
  {
    title: "Boundary",
    rows: [
      ["Purpose", "Private reflection"],
      ["Diagnosis", "Not provided"],
      ["Scoring", "Not provided"],
    ],
  },
];

export default function ProfilePage() {
  return (
    <InstrumentLayout
      title="SoulScope — Profile"
      description="SoulScope profile"
      eyebrow="Profile"
      heading="Your reflection space"
      meta={["Local build", "No account connected"]}
    >
      <section className="ss-settings-stack" aria-label="Profile">
        {sections.map((section) => (
          <section className="ss-settings-section" key={section.title}>
            <h2>{section.title}</h2>
            {section.rows.map(([label, value]) => (
              <div className="ss-setting-row" key={label}>
                <span>{label}</span>
                <strong>{value}</strong>
              </div>
            ))}
          </section>
        ))}
      </section>
    </InstrumentLayout>
  );
}
