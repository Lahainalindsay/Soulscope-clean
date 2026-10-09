import type { Metadata } from "next";
import "./globals.css";
import { Shell } from "@/components/shell";
export const metadata: Metadata = {
  title: { default: "SoulScope · Resonance Field", template: "%s · SoulScope" },
  description:
    "Observe your inner world through three guided voice responses. Save each scan, revisit what you noticed, and explore SoulScope's reflection design.",
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
