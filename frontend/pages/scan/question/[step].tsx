import type { GetStaticPaths, GetStaticProps } from "next";
import { PromptPanel } from "../../../components/scan/PromptPanel";
import { ScanStepper } from "../../../components/scan/ScanStepper";
import styles from "../../Page.module.css";

type QuestionPageProps = {
  step: 1 | 2 | 3;
};

export default function QuestionPage({ step }: QuestionPageProps) {
  return (
    <div className={styles.stack}>
      <ScanStepper activeStep={step} />
      <PromptPanel step={step} />
      <p className="humanCopy">Privacy note: this screen is a static visual presentation and does not save audio.</p>
    </div>
  );
}

export const getStaticPaths: GetStaticPaths = () => ({
  paths: ["/scan/question/1", "/scan/question/2", "/scan/question/3"],
  fallback: false,
});

export const getStaticProps: GetStaticProps<QuestionPageProps> = ({ params }) => {
  const rawStep = Number(params?.step);
  const step = rawStep === 2 || rawStep === 3 ? rawStep : 1;
  return { props: { step } };
};
