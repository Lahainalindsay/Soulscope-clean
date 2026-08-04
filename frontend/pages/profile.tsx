import { InstrumentLayout } from "../components/instrument/InstrumentLayout";

const sections = [
  {
    title: "Personal reference status",
    rows: [
      ["Reference signature", "Not created in this visual foundation"],
      ["Within-session reference", "Opening prompt only"],
      ["Version history", "Unavailable"],
    ],
  },
  {
    title: "Privacy",
    rows: [
      ["Audio retention", "Presentation control"],
      ["Result visibility", "Private by default presentation"],
      ["Data export", "Unavailable"],
    ],
  },
  {
    title: "Reflection preferences",
    rows: [
      ["Reflection depth", "Balanced"],
      ["Language style", "Bounded and plain"],
      ["Unresolved results", "Show clearly"],
    ],
  },
  {
    title: "Accessibility",
    rows: [
      ["Reduced motion", "Respected by CSS"],
      ["Contrast", "High contrast dark interface"],
      ["Touch targets", "44px minimum target"],
    ],
  },
];

export default function ProfilePage() {
  return (
    <InstrumentLayout
      title="SoulScope — Profile"
      description="SoulScope profile visual foundation"
      eyebrow="Profile"
      heading="Reference, privacy, and reflection preferences"
      meta={["Visual controls", "Not saved"]}
    >
      <section className="ss-settings-stack" aria-label="Profile presentation">
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
