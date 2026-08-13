import Head from "next/head";
import { ScanResultDashboard } from "../../components/results/ScanResultDashboard";

export default function ResultsDemoPage() {
  return (
    <>
      <Head>
        <title>SoulScope — Sample Scan Result</title>
        <meta
          name="description"
          content="A sample SoulScope result for one completed spoken scan."
        />
      </Head>
      <ScanResultDashboard />
    </>
  );
}
