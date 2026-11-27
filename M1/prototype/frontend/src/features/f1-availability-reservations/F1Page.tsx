/**
 * F1 Availability & Reservations — requirements R01–R03 — Owner: Member 1
 * R01: search by name or category + availability status (BR-01)
 * R02: reserve an item for a future calendar day (borrowers only)
 * R03: search response time shown against the 2-second target
 */
import { useCallback, useEffect, useState } from 'react';
import { api, errorMessage } from '../../api/client';
import { useAuth } from '../../auth/AuthContext';
import './f1.css';

type Availability = 'AVAILABLE' | 'RESERVED' | 'CHECKED_OUT';
interface Item {
  _id: string;
  name: string;
  category: string;
  canLeaveMakerspace: boolean;
  requiresSafetyBriefing: boolean;
  location: string;
  availability: Availability;
}
interface MyReservation {
  _id: string;
  equipment: { _id: string; name: string; category: string } | null;
  reservedFor: string;
  status: 'ACTIVE' | 'CANCELLED' | 'FULFILLED';
}

const LABEL: Record<Availability, string> = {
  AVAILABLE: 'Available',
  RESERVED: 'Reserved',
  CHECKED_OUT: 'Checked Out',
};
const BORROWERS = ['STUDENT', 'STAFF', 'LECTURER'];

/** Tomorrow (UTC) as YYYY-MM-DD: the earliest date the backend accepts (R02). */
const tomorrow = () => new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

export default function F1Page() {
  const { user } = useAuth();
  const canReserve = !!user && BORROWERS.includes(user.role);

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [takeHome, setTakeHome] = useState('');
  const [availability, setAvailability] = useState('');
  const [items, setItems] = useState<Item[]>([]);
  const [tookMs, setTookMs] = useState<number | null>(null);
  const [roundTripMs, setRoundTripMs] = useState<number | null>(null);
  const [reservations, setReservations] = useState<MyReservation[]>([]);
  const [reserving, setReserving] = useState<string | null>(null);
  const [date, setDate] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const runSearch = useCallback(async () => {
    const params: Record<string, string> = {};
    if (search.trim()) params.search = search.trim();
    if (category.trim()) params.category = category.trim();
    if (takeHome) params.canLeaveMakerspace = takeHome;
    if (availability) params.availability = availability;
    const t0 = performance.now();
    try {
      const { data } = await api.get('/availability', { params });
      setRoundTripMs(Math.round(performance.now() - t0));
      setItems(data.items);
      setTookMs(data.tookMs);
      setError('');
    } catch (e) {
      setError(errorMessage(e));
    }
  }, [search, category, takeHome, availability]);

  const loadReservations = useCallback(async () => {
    if (!canReserve) return;
    try {
      setReservations((await api.get('/reservations/mine')).data);
    } catch (e) {
      setError(errorMessage(e));
    }
  }, [canReserve]);

  useEffect(() => {
    runSearch();
    loadReservations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const reserve = async (equipmentId: string) => {
    setError('');
    setMessage('');
    try {
      await api.post('/reservations', { equipmentId, date });
      setMessage('Reservation created.');
      setReserving(null);
      setDate('');
      await Promise.all([runSearch(), loadReservations()]);
    } catch (e) {
      setError(errorMessage(e));
    }
  };

  const cancel = async (id: string) => {
    setError('');
    setMessage('');
    try {
      await api.patch(`/reservations/${id}/cancel`);
      setMessage('Reservation cancelled.');
      await Promise.all([runSearch(), loadReservations()]);
    } catch (e) {
      setError(errorMessage(e));
    }
  };

  return (
    <section className="f1">
      <p className="f1-eyebrow">F1 · R01–R03</p>
      <h2>Equipment availability &amp; reservations</h2>
      <p className="f1-lead">
        Search the catalogue, see what is Available, Reserved or Checked Out, and reserve an item for a future day.
      </p>

      <div className="f1-card" data-req="R01">
        <h3>Search equipment</h3>
        <div className="f1-body">
          <form
            className="f1-search"
            onSubmit={(e) => {
              e.preventDefault();
              runSearch();
            }}
          >
            <input placeholder="Item name" value={search} onChange={(e) => setSearch(e.target.value)} />
            <input placeholder="Category" value={category} onChange={(e) => setCategory(e.target.value)} />
            <select value={takeHome} onChange={(e) => setTakeHome(e.target.value)}>
              <option value="">Take-home and in-house</option>
              <option value="true">Take-home only</option>
              <option value="false">In-house only</option>
            </select>
            <select value={availability} onChange={(e) => setAvailability(e.target.value)}>
              <option value="">Any status</option>
              <option value="AVAILABLE">Available</option>
              <option value="RESERVED">Reserved</option>
              <option value="CHECKED_OUT">Checked Out</option>
            </select>
            <button type="submit" className="f1-btn">Search</button>
          </form>

          {tookMs !== null && (
            <p className="f1-timing" data-req="R03">
              {items.length} result(s) · server {tookMs} ms · round trip {roundTripMs} ms
              {roundTripMs !== null && (roundTripMs <= 2000 ? ' · within 2 s' : ' · over 2 s')}
            </p>
          )}
          {message && <p className="f1-msg success">{message}</p>}
          {error && <p className="f1-msg error">{error}</p>}

          <div className="f1-scroll">
            <table className="f1-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Category</th>
                  <th>Use</th>
                  <th>Safety briefing</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {items.map((it) => (
                  <tr key={it._id}>
                    <td>{it.name}</td>
                    <td>{it.category}</td>
                    <td>{it.canLeaveMakerspace ? 'Take-home' : 'In-house only'}</td>
                    <td>{it.requiresSafetyBriefing ? 'Required' : '—'}</td>
                    <td>{it.location}</td>
                    <td>
                      <span className={`f1-badge ${it.availability}`}>{LABEL[it.availability]}</span>
                    </td>
                    <td data-req="R02">
                      {canReserve &&
                        it.availability !== 'CHECKED_OUT' &&
                        (reserving === it._id ? (
                          <span className="f1-reserve">
                            <input
                              type="date"
                              min={tomorrow()}
                              value={date}
                              onChange={(e) => setDate(e.target.value)}
                            />
                            <button className="f1-btn" disabled={!date} onClick={() => reserve(it._id)}>
                              Confirm
                            </button>
                            <button
                              className="f1-btn secondary"
                              onClick={() => {
                                setReserving(null);
                                setDate('');
                              }}
                            >
                              Close
                            </button>
                          </span>
                        ) : (
                          <button
                            className="f1-btn"
                            onClick={() => {
                              setReserving(it._id);
                              setDate('');
                            }}
                          >
                            Reserve
                          </button>
                        ))}
                    </td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr>
                    <td colSpan={7} className="f1-muted">No equipment found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {canReserve && (
        <div className="f1-card">
          <h3>My reservations</h3>
          <div className="f1-body">
            <div className="f1-scroll">
              <table className="f1-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {reservations.map((r) => (
                    <tr key={r._id}>
                      <td>{r.equipment?.name ?? '(removed item)'}</td>
                      <td>{new Date(r.reservedFor).toISOString().slice(0, 10)}</td>
                      <td>{r.status}</td>
                      <td>
                        {r.status === 'ACTIVE' && (
                          <button className="f1-btn secondary" onClick={() => cancel(r._id)}>
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {reservations.length === 0 && (
                    <tr>
                      <td colSpan={4} className="f1-muted">No reservations yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}