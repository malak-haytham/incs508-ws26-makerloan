import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import './home.css';

const features = [
  { number: '01', title: 'Availability & reservations', description: 'Browse shared equipment and manage reservations.', to: '/availability', icon: '⌕' },
  { number: '02', title: 'Check-out & check-in', description: 'Issue equipment and record returned items.', to: '/desk', icon: '⇄' },
  { number: '03', title: 'Item tracking', description: 'Follow equipment status and current location.', to: '/tracking', icon: '◎' },
  { number: '04', title: 'Overdue handling', description: 'Review overdue loans and follow up with borrowers.', to: '/overdue', icon: '◷' },
  { number: '05', title: 'Safety briefings', description: 'Record completed briefings and check certification.', to: '/safety', icon: '✓' },
];

export default function Home() {
  const { user } = useAuth();
  const firstName = user?.fullName.split(' ')[0] ?? 'there';

  return (
    <main className="home-page">
      <section className="home-hero">
        <div className="home-hero-copy">
          <span className="home-eyebrow"><span /> MAKERSPACE OPERATIONS</span>
          <h1>A better way to keep making.</h1>
          <p>Manage shared equipment, lending activity, and safety records from one simple workspace.</p>
          <Link to="/availability" className="home-primary-link">Explore equipment <span aria-hidden="true">→</span></Link>
        </div>
        <div className="home-hero-art" aria-hidden="true">
          <div className="home-art-ring ring-back" /><div className="home-art-ring ring-front" />
          <div className="home-art-card"><span>ML</span><strong>Shared tools.<br />Big ideas.</strong><small>MAKERLOAN WORKSPACE</small></div>
          <span className="home-art-dot dot-a" /><span className="home-art-dot dot-b" />
        </div>
      </section>

      <div className="home-welcome-row">
        <div><span className="home-section-eyebrow">YOUR WORKSPACE</span><h2>Welcome back, {firstName}</h2></div>
        <span className="home-role-pill">{user?.role?.replaceAll('_', ' ')}</span>
      </div>

      <section className="home-feature-grid" aria-label="MakerLoan features">
        {features.map((feature) => (
          <Link className="home-feature-card" key={feature.number} to={feature.to}>
            <div className="home-feature-card-top"><span className="home-feature-icon" aria-hidden="true">{feature.icon}</span><span className="home-feature-number">{feature.number}</span></div>
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
            <span className="home-feature-action">Open workspace <span aria-hidden="true">↗</span></span>
          </Link>
        ))}
      </section>

      <aside className="home-note"><span className="home-note-mark" aria-hidden="true">i</span><p><strong>Built for the GIU makerspace.</strong> MakerLoan helps students and staff share equipment responsibly and keep every loan accounted for.</p></aside>
    </main>
  );
}
