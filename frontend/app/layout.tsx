import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";
import "./globals.css";
import { Shell } from "@/components/shell";
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "SoulScope · Resonance Field", template: "%s · SoulScope" },
  description:
    "Three guided voice responses. Save a moment, explore supported recording observations, and return with your own perspective.",
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
