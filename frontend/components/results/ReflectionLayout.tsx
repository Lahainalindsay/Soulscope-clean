import { demoResultPresentation } from "../../mocks/demoResultPresentation";
import { StatusBadge } from "../ui/StatusBadge";
import styles from "./Results.module.css";

export function ReflectionLayout() {
  return (
    <section className={styles.reflection} aria-labelledby="reflection-title">
      <div>
        <p className="instrumentLabel">Human reflection · demonstration copy</p>
        <h2 id="reflection-title" className={styles.lead}>
          {demoResultPresentation.headline}
        </h2>
        <p className="humanCopy">{demoResultPresentation.lead}</p>
      </div>
      <div className={styles.facets}>
        {demoResultPresentation.facets.map((facet) => (
          <article className={styles.facet} key={facet.title}>
            <StatusBadge>{facet.label}</StatusBadge>
            <h3>{facet.title}</h3>
            <p>{facet.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
