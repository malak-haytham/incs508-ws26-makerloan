import type { Briefing } from './types';
import { SafetyStatusBadge } from './SafetyStatusBadge';

export function BriefingHistoryPanel({ briefings }: { briefings: Briefing[] }) {
  return (
    <section className="safety-card safety-history" aria-labelledby="history-heading">
      <div className="safety-card-heading">
        <div><span className="safety-step">REVIEW</span><h2 id="history-heading">Briefing history</h2></div>
        <span className="safety-history-count">{briefings.length} records</span>
      </div>
      <p className="safety-card-copy">Most recently recorded briefings appear first.</p>
      {briefings.length === 0 ? (
        <div className="safety-empty"><span aria-hidden="true">◷</span><strong>No briefings recorded yet</strong><span>Completed briefings will appear here.</span></div>
      ) : (
        <div className="safety-table-wrap">
          <table className="safety-table">
            <thead><tr><th scope="col">Borrower</th><th scope="col">Recorded</th><th scope="col">Staff member</th><th scope="col">Status</th></tr></thead>
            <tbody>
              {briefings.map((briefing) => (
                <tr key={briefing._id}>
                  <td><strong>{briefing.user?.fullName ?? 'Borrower unavailable'}</strong><span className="safety-table-subtitle">{briefing.user?.email ?? 'Account no longer available'}</span></td>
                  <td><time dateTime={briefing.briefedAt}>{new Date(briefing.briefedAt).toLocaleString()}</time></td>
                  <td>{briefing.recordedBy?.fullName ?? 'Staff member unavailable'}</td>
                  <td>{briefing.user && <SafetyStatusBadge certified={briefing.user.safetyCertified} />}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
