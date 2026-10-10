import type { Metadata } from "next";
import Link from "next/link";
import { PublicPage } from "@/components/public-page";
import { OPERATOR, SUPPORT_EMAIL, POLICY_UPDATED } from "@/lib/site";
export const metadata: Metadata = { title: 'Legal & service information', description: 'SoulScope legal information, privacy notice, beta terms, and contact details.', alternates: { canonical: "/legal" } };
export default function Page() { return <PublicPage eyebrow="SOULSCOPE" title="Legal & service information">
<p className="lead">SoulScope is operated by {OPERATOR}. These pages describe the current beta service and how to contact us.</p>
<section className="panel"><h2>Service notices</h2><p><Link href="/privacy">Privacy notice</Link> — account data, voice recordings, service providers, and current retention limits.</p><p><Link href="/terms">Beta terms of service</Link> — what the service provides, appropriate use, and current limitations.</p><p><Link href="/contact">Contact</Link> — account support, feedback, and privacy requests.</p></section>
<section className="panel"><h2>A service in development</h2><p>SoulScope is a beta self-observation service. Psychological interpretations and the measured Signature are not ready. It is not medical care, diagnosis, treatment, or an emergency service.</p><p>Regional legal terms and retention periods are still being finalized. These notices describe current operation and do not claim that a legal review has been completed.</p></section>
</PublicPage>; }
