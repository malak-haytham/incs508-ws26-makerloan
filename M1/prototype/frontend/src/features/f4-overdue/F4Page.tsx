/**
 * F4 Overdue Handling — requirements R10–R12
 * Owner: Member 4 (Mohamed Amro)
 * Loan desk view of overdue loans and the reminder sent for each one.
 */
import { useCallback, useEffect, useState } from 'react';
import { api, errorMessage } from '../../api/client';
import { useAuth } from '../../auth/AuthContext';
import '../../components/feature-pages.css';
import './f4.css';

interface OverdueLoan {
  _id: string;
  dueDate: string;
  flaggedAt: string | null;
  equipment: { name: string; category: string } | null;
  borrower: { fullName: string; email: string } | null;
  reminder: { channel: string; to: string | null; sentAt: string | null; delayMs: number | null; withinTarget: boolean | null };
}
interface Timeliness {
  month: string;
  overdueLoansFlagged: number;
  remindedWithin15Min: number;
  percentWithinTarget: number | null;
  meetsR11: boolean | null;
}
interface RunResult { flagged: number; reminded: number; ranAt: string }

const STAFF_ROLES = ['DESK_ASSISTANT', 'MANAGER'];
const REFRESH_MS = 30_000;

const fmt = (iso: string | null) => (iso ? new Date(iso).toLocaleString() : '—');
const minutes = (ms: number | null) => (ms === null ? '—' : `${(ms / 60000).toFixed(1)} min`);

export default function F4Page() {
  const { user } = useAuth();
  const isStaff = !!user && STAFF_ROLES.includes(user.role);

  const [loans, setLoans] = useState<OverdueLoan[]>([]);
  const [stats, setStats] = useState<Timeliness | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [running, setRunning] = useState(false);
  const [lastRun, setLastRun] = useState<RunResult | null>(null);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);

  const load = useCallback(async () => {
    setError('');
    try {
      const [l, t] = await Promise.all([
        api.get<OverdueLoan[]>('/overdue'),
        api.get<Timeliness>('/overdue/timeliness'),
      ]);
      setLoans(l.data);
      setStats(t.data);
      setUpdatedAt(new Date());
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isStaff) { setLoading(false); return; }
    void load();
    // The backend job runs every minute; refresh so new flags and reminders appear without a reload.
    const id = setInterval(() => void load(), REFRESH_MS);
    return () => clearInterval(id);
  }, [isStaff, load]);

  async function runNow() {
    setRunning(true);
    setError('');
    try {
      const r = await api.post<RunResult>('/overdue/run');
      setLastRun(r.data);
      await load();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setRunning(false);
    }
  }

  const reminded = loans.filter((l) => l.reminder.sentAt).length;

  return (
    <main className="module-page f4">
      <section className="module-hero">
        <div className="module-hero-copy">
          <span className="module-eyebrow">MAKERLOAN · FEATURE 04</span>
          <h1>Overdue handling</h1>
          <p>Loans past their due date are flagged automatically, and the borrower gets an email reminder at their university address.</p>
          <div className="module-requirements" aria-label="Related requirements">
            <span>R10 Flag overdue</span><span>R11 Reminder within 15 min</span><span>R12 Email only</span>
          </div>
        </div>
        <div className="module-art" aria-hidden="true">
          <div className="module-art-orbit orbit-one" />
          <div className="module-art-orbit orbit-two" />
          <div className="module-art-core">04</div>
          <span className="module-art-spark spark-one" />
          <span className="module-art-spark spark-two" />
        </div>
      </section>

      {!isStaff ? (
        <div className="f4-msg info" role="status">
          Only loan desk assistants and the manager can see overdue loans. Log in as <code>desk@giu-uni.de</code> or <code>manager@giu-uni.de</code>.
        </div>
      ) : (
        <>
          <div className="f4-toolbar">
            <button className="f4-btn" onClick={() => void runNow()} disabled={running} data-req="R10">
              {running ? 'Running…' : 'Run overdue check now'}
            </button>
            <span className="f4-muted">
              Runs automatically every minute. {updatedAt && <>Last refreshed {updatedAt.toLocaleTimeString()}.</>}
            </span>
          </div>

          {lastRun && (
            <div className="f4-msg success" role="status">
              Check finished: {lastRun.flagged} loan(s) flagged as Overdue, {lastRun.reminded} reminder(s) sent.
            </div>
          )}
          {error && (
            <div className="f4-msg error" role="alert">
              {error} <button className="f4-btn secondary" onClick={() => void load()}>Retry</button>
            </div>
          )}

          <div className="f4-stats">
            <div className="f4-stat" data-req="R10">
              <span className="f4-stat-label">Overdue loans</span>
              <strong>{loading ? '…' : loans.length}</strong>
            </div>
            <div className="f4-stat" data-req="R11">
              <span className="f4-stat-label">Reminders sent</span>
              <strong>{loading ? '…' : `${reminded} / ${loans.length}`}</strong>
            </div>
            <div className="f4-stat" data-req="R11">
              <span className="f4-stat-label">R11 this month ({stats?.month ?? '…'})</span>
              <strong>{stats?.percentWithinTarget == null ? '—' : `${stats.percentWithinTarget}%`}</strong>
              <span className={`f4-badge ${stats?.meetsR11 === false ? 'late' : 'ok'}`}>
                {stats?.meetsR11 == null ? 'No overdue loans yet' : stats.meetsR11 ? 'Target 95% met' : 'Below 95% target'}
              </span>
            </div>
          </div>

          <div className="f4-card">
            <h3>Overdue loans</h3>
            {loading ? (
              <p className="f4-body f4-muted">Loading…</p>
            ) : loans.length === 0 ? (
              <p className="f4-body f4-muted">No overdue loans. Everything is back on time.</p>
            ) : (
              <div className="f4-table-wrap">
                <table className="f4-table">
                  <thead>
                    <tr>
                      <th>Item</th><th>Borrower</th><th>Due</th>
                      <th data-req="R10">Flagged overdue</th>
                      <th data-req="R12">Reminder sent to</th>
                      <th data-req="R11">Reminder sent</th>
                      <th data-req="R11">Delay</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loans.map((l) => (
                      <tr key={l._id}>
                        <td>{l.equipment?.name ?? '—'}<div className="f4-muted small">{l.equipment?.category}</div></td>
                        <td>{l.borrower?.fullName ?? '—'}</td>
                        <td>{fmt(l.dueDate)}</td>
                        <td><span className="f4-badge overdue">OVERDUE</span><div className="f4-muted small">{fmt(l.flaggedAt)}</div></td>
                        <td>
                          <span className="f4-badge channel">{l.reminder.channel}</span>
                          <div className="f4-muted small">{l.reminder.to ?? '—'}</div>
                        </td>
                        <td>{l.reminder.sentAt ? fmt(l.reminder.sentAt) : <span className="f4-badge pending">Pending</span>}</td>
                        <td>
                          {minutes(l.reminder.delayMs)}{' '}
                          {l.reminder.withinTarget !== null && (
                            <span className={`f4-badge ${l.reminder.withinTarget ? 'ok' : 'late'}`}>
                              {l.reminder.withinTarget ? '≤ 15 min' : '> 15 min'}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <p className="f4-note" data-req="R12">
            Reminders go only by email, through the university's email service, to the borrower's university account
            address. In this prototype the email is simulated: it is written to the server log and stored as a
            notification and an audit entry with its timestamp.
          </p>
        </>
      )}
    </main>
  );
}
