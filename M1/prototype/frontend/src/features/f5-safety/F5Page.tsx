import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { api, errorMessage } from '../../api/client';
import { useAuth } from '../../auth/AuthContext';

type Borrower = { _id: string; fullName: string; email: string; safetyCertified: boolean };
type Briefing = {
  _id: string; briefedAt: string;
  user?: { _id: string; fullName: string; email: string; safetyCertified: boolean };
  recordedBy?: { fullName: string; role: string };
};

const staffRoles = ['DESK_ASSISTANT', 'MANAGER', 'SAFETY_OFFICER'];

export default function F5Page() {
  const { user } = useAuth();
  const canRecord = staffRoles.includes(user?.role ?? '');
  const [borrowers, setBorrowers] = useState<Borrower[]>([]);
  const [briefings, setBriefings] = useState<Briefing[]>([]);
  const [borrowerId, setBorrowerId] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    if (!canRecord) return;
    try {
      const [borrowerResult, briefingResult] = await Promise.all([
        api.get<Borrower[]>('/safety/borrowers'),
        api.get<Briefing[]>('/safety/briefings'),
      ]);
      setBorrowers(borrowerResult.data);
      setBriefings(briefingResult.data);
      setBorrowerId((current) => current || borrowerResult.data[0]?._id || '');
    } catch (e) {
      setError(errorMessage(e));
    }
  }, [canRecord]);

  useEffect(() => { void refresh(); }, [refresh]);

  const selected = borrowers.find((b) => b._id === borrowerId);
  const record = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setMessage('');
    setBusy(true);
    try {
      await api.post('/safety/briefings', { borrowerId });
      setMessage(`Safety briefing recorded for ${selected?.fullName ?? 'borrower'}.`);
      await refresh();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  if (!canRecord) {
    return <section><h2>F5 Safety Verification</h2><p>Safety briefing records are available to desk assistants, managers, and safety officers.</p></section>;
  }

  return (
    <section>
      <h2>F5 Safety Verification</h2>
      <p>Record a completed safety briefing. The borrower’s certification is then available to the check-out safety check.</p>

      <form onSubmit={record} style={{ display: 'grid', gap: 12, maxWidth: 520, padding: 16, border: '1px solid #ccc', borderRadius: 8 }}>
        <label htmlFor="safety-borrower">Borrower</label>
        <select id="safety-borrower" data-req="R13" value={borrowerId} onChange={(e) => setBorrowerId(e.target.value)} required>
          {borrowers.map((borrower) => <option key={borrower._id} value={borrower._id}>{borrower.fullName} ({borrower.email})</option>)}
        </select>
        {selected && <p data-req="R14" style={{ margin: 0 }}>Current status: <strong>{selected.safetyCertified ? 'Safety certified' : 'Not certified'}</strong></p>}
        <button type="submit" disabled={busy || !borrowerId}>{busy ? 'Recording…' : 'Record completed briefing'}</button>
        {message && <p role="status">{message}</p>}
        {error && <p role="alert" style={{ color: '#a00' }}>{error}</p>}
      </form>

      <h3>Recent briefing records</h3>
      {briefings.length === 0 ? <p>No safety briefings have been recorded yet.</p> : (
        <ul>
          {briefings.map((briefing) => (
            <li key={briefing._id}>
              <strong>{briefing.user?.fullName ?? 'Borrower'}</strong>
              {' — '}{new Date(briefing.briefedAt).toLocaleString()}
              {briefing.recordedBy?.fullName ? ` — recorded by ${briefing.recordedBy.fullName}` : ''}
              {briefing.user ? ` — ${briefing.user.safetyCertified ? 'certified' : 'not certified'}` : ''}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
