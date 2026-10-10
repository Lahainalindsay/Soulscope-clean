import type { Metadata } from "next";
import Link from "next/link";
import { PublicPage } from "@/components/public-page";
import { OPERATOR, SUPPORT_EMAIL, POLICY_UPDATED } from "@/lib/site";
export const metadata: Metadata = { title: 'Frequently asked questions', description: 'Answers about SoulScope voice scans, recording summaries, privacy, and the Signature in development.', alternates: { canonical: "/faq" } };
export default function Page() { return <PublicPage eyebrow="SOULSCOPE" title="Frequently asked questions">
<p className="lead">A little context for your next moment of reflection.</p>
{[
["What is SoulScope?", "SoulScope is a beta voice-reflection service operated by Soulscope Technologies. Three short spoken responses create a saved moment you can revisit."],
["How long does a scan take?", "There are three guided responses of approximately 30 seconds each. You can listen back and record again before submitting."],
["What will my result show?", "When the recording qualifies, the current release offers a description of detected quieter audio across your responses and a question for your own reflection. The date and time help you return to that moment. Technical details are available separately."],
["Does it understand the words I say?", "The current processing path analyzes acoustic features. It does not transcribe your speech or interpret its topic. Speaking throughout a response does not guarantee that every acoustic feature will qualify."],
["Why might a result be unavailable?", "A recording needs sufficient supported detail for a summary. Poor audio quality or missing evidence can prevent one. Psychological interpretations remain unavailable while the scientific calibration is unfinished; a recording summary does not resolve them."],
["What does voice energy mean here?", "A reliable voice-energy reading is not available in this release. The site does not substitute a mood or capacity rating for a missing measurement."],
["Is the artwork my measured Signature?", "The current artwork is illustrative. The measured Signature is still in development."],
["Can SoulScope diagnose me or reveal who I am?", "No. A voice recording cannot establish identity, a personality type, a medical condition, or a hidden truth. SoulScope is for self-observation, and your experience remains yours to interpret."],
["Where are my recordings kept?", "Audio stays on the scan page until you submit it. Submitted audio is stored privately by the backend, and derived records are saved in your account. Automatic audio deletion has not been confirmed; see our privacy notice for the current retention limits."],
["How can I get help or request deletion?", "Email soulscope808@gmail.com from your account email. We may need to verify ownership before handling account data. Avoid including passwords, sensitive recordings, or identifying information about other people."],
].map(([question, answer]) => <section className="panel faq-answer" key={question}><h2>{question}</h2><p>{answer}</p></section>)}
</PublicPage>; }
