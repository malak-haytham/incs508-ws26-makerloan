import { useCallback, useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { api, errorMessage } from '../../api/client';
import './f2.css';

type Condition = 'GOOD' | 'DAMAGED' | 'MISSING_PARTS';
interface Borrower { _id: string; fullName: string; email: string; safetyCertified: boolean }
interface EquipmentOption { _id: string; name: string; category: string; status: string; requiresSafetyBriefing: boolean }
interface ActiveLoan {
  _id: string;
  dueDate: string;
  status: 'ACTIVE' | 'OVERDUE';
  equipment: { _id: string; name: string; category: string };
  borrower: { _id: string; fullName: string; email: string };
}
interface Message { type: 'success' | 'error'; text: string }

const CONDITION_LABELS: Record<Condition, string> = {
  GOOD: 'Good',
  DAMAGED: 'Damaged',
  MISSING_PARTS: 'Missing parts',
};

const tomorrow = () => new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

export default function F2Page() {
  const [borrowers, setBorrowers] = useState<Borrower[]>([]);
  const [items, setItems] = useState<EquipmentOption[]>([]);
  const [loans, setLoans] = useState<ActiveLoan[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [message, setMessage] = useState<Message | null>(null);

  const [borrowerId, setBorrowerId] = useState('');
  const [equipmentId, setEquipmentId] = useState('');
  const [dueDate, setDueDate] = useState(tomorrow());
  const [checkingOut, setCheckingOut] = useState(false);

  const [returning, setReturning] = useState<ActiveLoan | null>(null);
  const [condition, setCondition] = useState<Condition>('GOOD');
  const [notes, setNotes] = useState('');
  const [checkingIn, setCheckingIn] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const [b, e, l] = await Promise.all([
        api.get<Borrower[]>('/loans/borrowers'),
        api.get<EquipmentOption[]>('/loans/available-equipment'),
        api.get<ActiveLoan[]>('/loans/active'),
      ]);
      setBorrowers(b.data);
      setItems(e.data);
      setLoans(l.data);
    } catch (err) {
      setLoadError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function submitCheckout(ev: FormEvent) {
    ev.preventDefault();
    setMessage(null);
    setCheckingOut(true);
    try {
      await api.post('/loans/checkout', { equipmentId, borrowerId, dueDate });
      setMessage({ type: 'success', text: 'Item checked out. The loan is now active.' });
      setEquipmentId('');
      setBorrowerId('');
      setDueDate(tomorrow());
      await load();
    } catch (err) {
      setMessage({ type: 'error', text: errorMessage(err) });
    } finally {
      setCheckingOut(false);
    }
  }

  function startCheckin(loan: ActiveLoan) {
    setMessage(null);
    setReturning(loan);
    setCondition('GOOD');
    setNotes('');
  }

  async function submitCheckin(ev: FormEvent) {
    ev.preventDefault();
    if (!returning) return;
    setMessage(null);
    setCheckingIn(true);
    try {
      await api.post(`/loans/${returning._id}/checkin`, {
        condition,
        conditionNotes: notes.trim() || undefined,
      });
      setMessage({ type: 'success', text: `${returning.equipment.name} returned and recorded as ${CONDITION_LABELS[condition].toLowerCase()}.` });
      setReturning(null);
      await load();
    } catch (err) {
      setMessage({ type: 'error', text: errorMessage(err) });
    } finally {
      setCheckingIn(false);
    }
  }

  return (
    <section className="f2">
      <h2>Desk: Check-out &amp; Check-in</h2>

      {message && <div className={`f2-msg ${message.type}`} role="status">{message.text}</div>}
      {loadError && (
        <div className="f2-msg error" role="alert">
          {loadError} <button className="f2-btn secondary" onClick={() => void load()}>Retry</button>
        </div>
      )}

      <div className="f2-card" data-req="R04">
        <h3>Check out an item</h3>
        <div className="f2-body">
          <form className="f2-form" onSubmit={submitCheckout}>
            <label>
              Borrower
              <select value={borrowerId} onChange={(e) => setBorrowerId(e.target.value)} required disabled={loading}>
                <option value="">Select a borrower</option>
                {borrowers.map((b) => (
                  <option key={b._id} value={b._id}>{b.fullName} ({b.email})</option>
                ))}
              </select>
            </label>
            <label>
              Item
              <select value={equipmentId} onChange={(e) => setEquipmentId(e.target.value)} required disabled={loading}>
                <option value="">Select an item</option>
                {items.map((i) => (
                  <option key={i._id} value={i._id}>
                    {i.name} ({i.category}){i.requiresSafetyBriefing ? ' - safety briefing required' : ''}{i.status === 'RESERVED' ? ' - reserved' : ''}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Due date
              <input type="date" value={dueDate} min={tomorrow()} onChange={(e) => setDueDate(e.target.value)} required />
            </label>
            <div className="f2-actions">
              <button className="f2-btn" type="submit" disabled={checkingOut || loading}>
                {checkingOut ? 'Checking out...' : 'Check out'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {returning && (
        <div className="f2-card" data-req="R05">
          <h3>Check in: {returning.equipment.name}</h3>
          <div className="f2-body">
            <p className="f2-muted">Borrowed by {returning.borrower.fullName}</p>
            <form className="f2-form" onSubmit={submitCheckin}>
              <label>
                Condition on return
                <select value={condition} onChange={(e) => setCondition(e.target.value as Condition)}>
                  {(Object.keys(CONDITION_LABELS) as Condition[]).map((c) => (
                    <option key={c} value={c}>{CONDITION_LABELS[c]}</option>
                  ))}
                </select>
              </label>
              <label>
                Notes (optional)
                <textarea rows={3} maxLength={500} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g. cracked USB cable" />
              </label>
              <div className="f2-actions">
                <button className="f2-btn" type="submit" disabled={checkingIn}>
                  {checkingIn ? 'Saving...' : 'Confirm return'}
                </button>
                <button className="f2-btn secondary" type="button" onClick={() => setReturning(null)} disabled={checkingIn}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="f2-card" data-req="R06">
        <h3>Items currently out</h3>
        <div className="f2-body">
          {loading ? (
            <p className="f2-muted">Loading...</p>
          ) : loans.length === 0 ? (
            <p className="f2-muted">No items are out right now.</p>
          ) : (
            <table className="f2-table">
              <thead>
                <tr><th>Item</th><th>Borrower</th><th>Due</th><th>Status</th><th></th></tr>
              </thead>
              <tbody>
                {loans.map((l) => (
                  <tr key={l._id}>
                    <td>{l.equipment.name}</td>
                    <td>{l.borrower.fullName}</td>
                    <td>{new Date(l.dueDate).toLocaleDateString()}</td>
                    <td><span className={`f2-badge ${l.status}`}>{l.status}</span></td>
                    <td><button className="f2-btn secondary" onClick={() => startCheckin(l)}>Check in</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </section>
  );
}