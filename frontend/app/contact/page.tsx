import type { Metadata } from "next";
import Link from "next/link";
import { PublicPage } from "@/components/public-page";
import { OPERATOR, SUPPORT_EMAIL, POLICY_UPDATED } from "@/lib/site";
export const metadata: Metadata = { title: 'Contact', description: 'Contact Soulscope Technologies for account help, questions, feedback, or privacy requests.', alternates: { canonical: "/contact" } };
export default function Page() { return <PublicPage eyebrow="SOULSCOPE" title="Contact">
<p className="lead">Questions, feedback, or something not working? We would like to hear from you.</p>
<section className="panel"><h2>Get in touch</h2><address>{OPERATOR}<br /><a className="text-link" href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a></address><p>Email us for account support, product feedback, or privacy requests. Include your account email and a brief description. Do not send your password or a voice recording by email.</p><p>We may need to verify account ownership before acting on requests involving personal data.</p></section>
<section className="panel"><h2>Before you write</h2><p>Our <Link href="/faq">frequently asked questions</Link> explain the guided scan and the current limits of results.</p></section>
</PublicPage>; }
