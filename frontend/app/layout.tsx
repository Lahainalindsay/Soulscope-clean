import type { Metadata } from "next";
import "./globals.css";
import { Shell } from "@/components/shell";
export const metadata: Metadata = {
  title: { default: "SoulScope · Resonance Field", template: "%s · SoulScope" },
  description:
    "A quiet space to explore your voice through three guided responses and return to your reflections over time.",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
