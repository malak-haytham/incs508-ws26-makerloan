import { Link } from 'react-router-dom';
import './feature-pages.css';

interface Props {
  number: string;
  title: string;
  description: string;
  requirements: string[];
  destination: string;
  destinationLabel: string;
}

export default function FeaturePlaceholder({ number, title, description, requirements, destination, destinationLabel }: Props) {
  return (
    <main className="module-page">
      <section className="module-hero">
        <div className="module-hero-copy">
          <span className="module-eyebrow">MAKERLOAN · FEATURE {number}</span>
          <h1>{title}</h1>
          <p>{description}</p>
          <div className="module-requirements" aria-label="Related requirements">
            {requirements.map((requirement) => <span key={requirement}>{requirement}</span>)}
          </div>
        </div>
        <div className="module-art" aria-hidden="true">
          <div className="module-art-orbit orbit-one" />
          <div className="module-art-orbit orbit-two" />
          <div className="module-art-core">{number}</div>
          <span className="module-art-spark spark-one" />
          <span className="module-art-spark spark-two" />
        </div>
      </section>

      <section className="module-content-grid">
        <article className="module-workspace-card">
          <span className="module-card-icon" aria-hidden="true">✦</span>
          <div>
            <span className="module-card-eyebrow">FEATURE WORKSPACE</span>
            <h2>{title}</h2>
            <p>This area is connected to the MakerLoan workspace. Its feature workflow is being prepared for the prototype.</p>
            <span className="module-status"><span />Feature interface pending</span>
          </div>
        </article>
        <aside className="module-help-card">
          <span className="module-card-eyebrow">KEEP EXPLORING</span>
          <h2>Go to {destinationLabel}</h2>
          <p>Continue to a feature with a working interface.</p>
          <Link to={destination} className="module-link">Open feature <span aria-hidden="true">↗</span></Link>
        </aside>
      </section>
    </main>
  );
}
