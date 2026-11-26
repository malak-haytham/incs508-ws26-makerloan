import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { api, errorMessage } from '../../api/client';
import { useAuth } from '../../auth/AuthContext';
import { BriefingHistoryPanel } from './BriefingHistoryPanel';
import { BriefingRecordPanel } from './BriefingRecordPanel';
import './f5-safety.css';
import type { Borrower, Briefing } from './types';

const staffRoles = ['DESK_ASSISTANT', 'MANAGER', 'SAFETY_OFFICER'];

export default function F5Page() {
  const { user } = useAuth();
  const canRecord = staffRoles.includes(user?.role ?? '');
  const [borrowers, setBorrowers] = useState<Borrower[]>([]);
  const [briefings, setBriefings] = useState<Briefing[]>([]);
  const [borrowerId, setBorrowerId] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    if (!canRecord) { setLoading(false); return; }
    setError('');
    try {
      const [borrowerResult, briefingResult] = await Promise.all([
        api.get<Borrower[]>('/safety/borrowers'),
        api.get<Briefing[]>('/safety/briefings'),
      ]);
      setBorrowers(borrowerResult.data);
      setBriefings(briefingResult.data);
      setBorrowerId((current) => borrowerResult.data.some((b) => b._id === current) ? current : borrowerResult.data[0]?._id ?? '');
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [canRecord]);

  useEffect(() => { void refresh(); }, [refresh]);

  const selected = borrowers.find((b) => b._id === borrowerId);
  const filteredBorrowers = useMemo(() => {
    const query = search.trim().toLowerCase();
    return query ? borrowers.filter((b) => `${b.fullName} ${b.email}`.toLowerCase().includes(query)) : borrowers;
  }, [borrowers, search]);
  const certifiedCount = borrowers.filter((borrower) => borrower.safetyCertified).length;

  const record = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setMessage('');
    setBusy(true);
    try {
      await api.post('/safety/briefings', { borrowerId });
      setMessage(`Briefing recorded for ${selected?.fullName ?? 'borrower'}.`);
      await refresh();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  if (!canRecord) {
    return (
      <main className="safety-page">
        <header className="safety-header"><span className="safety-eyebrow">MAKERLOAN · F5</span><h1>Safety briefing verification</h1></header>
        <div className="safety-notice" role="status">Briefing records are available to desk assistants, managers, and safety officers.</div>
      </main>
    );
  }

  return (
    <main className="safety-page">
      <header className="safety-header">
        <div><span className="safety-eyebrow">MAKERLOAN · F5</span><h1>Safety briefing verification</h1></div>
        <span className="safety-role">{user?.role?.replaceAll('_', ' ')}</span>
      </header>
      <p className="safety-intro">Keep briefing records up to date so the desk can verify training before lending safety-relevant equipment.</p>

      <section className="safety-stats" aria-label="Safety briefing overview">
        <article className="safety-stat"><span>Active borrowers</span><strong>{loading ? '—' : borrowers.length}</strong></article>
        <article className="safety-stat"><span>Certified borrowers</span><strong>{loading ? '—' : certifiedCount}</strong></article>
        <article className="safety-stat"><span>Briefings recorded</span><strong>{loading ? '—' : briefings.length}</strong></article>
      </section>

      {error && <div className="safety-error" role="alert"><span>{error}</span><button type="button" onClick={() => void refresh()}>Try again</button></div>}
      {message && <div className="safety-success" role="status">{message}</div>}
      {loading ? <div className="safety-empty" aria-live="polite">Loading safety records…</div> : (
        <section className="safety-workspace">
          <BriefingRecordPanel
            borrowers={filteredBorrowers}
            borrowerId={borrowerId}
            selected={selected}
            search={search}
            busy={busy}
            onSearch={setSearch}
            onBorrowerChange={setBorrowerId}
            onSubmit={record}
          />
          <BriefingHistoryPanel briefings={briefings} />
        </section>
      )}
    </main>
  );
}
