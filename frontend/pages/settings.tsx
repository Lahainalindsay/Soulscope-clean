import { InstrumentLayout } from "../components/instrument/InstrumentLayout";

const settings = [
  ["Privacy", "Private presentation defaults", "Visual-foundation control"],
  ["Audio retention preference", "Ask before saving audio", "Visual-foundation control"],
  ["Accessibility", "Reduced motion and readable contrast", "Visual-foundation control"],
  ["Reflection style", "Plain, reflective, bounded", "Visual-foundation control"],
  ["Account actions", "Unavailable until authentication is approved", "Presentation only"],
];

export default function SettingsPage() {
  return (
    <InstrumentLayout
      title="SoulScope — Settings"
      description="SoulScope settings visual foundation"
      eyebrow="Settings"
      heading="Application preferences"
      meta={["Non-persistent", "No account integration"]}
    >
      <section className="ss-settings-stack" aria-label="Settings presentation">
        <section className="ss-settings-section">
          <h2>Visual-foundation controls</h2>
          {settings.map(([label, value, note]) => (
            <div className="ss-setting-row" key={label}>
              <span>{label}</span>
              <strong>{value}</strong>
              <small>{note}</small>
            </div>
          ))}
        </section>
      </section>
    </InstrumentLayout>
  );
}
