import type { FormEvent } from 'react';
import type { Borrower } from './types';
import { SafetyStatusBadge } from './SafetyStatusBadge';

interface Props {
  borrowers: Borrower[];
  borrowerId: string;
  selected?: Borrower;
  search: string;
  busy: boolean;
  onSearch: (value: string) => void;
  onBorrowerChange: (value: string) => void;
  onSubmit: (event: FormEvent) => void;
}

export function BriefingRecordPanel({ borrowers, borrowerId, selected, search, busy, onSearch, onBorrowerChange, onSubmit }: Props) {
  return (
    <section className="safety-card" aria-labelledby="record-heading">
      <div className="safety-card-heading">
        <div><span className="safety-step">RECORD</span><h2 id="record-heading">Log a completed briefing</h2></div>
        <span className="safety-card-icon" aria-hidden="true">✓</span>
      </div>
      <p className="safety-card-copy">Choose the borrower after the briefing has been completed.</p>
      <form className="safety-form" onSubmit={onSubmit}>
        <label htmlFor="borrower-search">Find borrower</label>
        <input
          id="borrower-search"
          type="search"
          placeholder="Search by name or email"
          value={search}
          onChange={(event) => onSearch(event.target.value)}
          aria-controls="safety-borrower"
        />
        <label htmlFor="safety-borrower">Borrower</label>
        <select id="safety-borrower" data-req="R13" value={borrowerId} onChange={(event) => onBorrowerChange(event.target.value)} required>
          {borrowers.length === 0 && <option value="">No matching active borrowers</option>}
          {selected && !borrowers.some((borrower) => borrower._id === selected._id) && <option value={selected._id}>{selected.fullName} · {selected.email}</option>}
          {borrowers.map((borrower) => <option key={borrower._id} value={borrower._id}>{borrower.fullName} · {borrower.email}</option>)}
        </select>
        {selected && (
          <div className="safety-selected" data-req="R14">
            <div><span className="safety-selected-label">Current certification</span><strong>{selected.fullName}</strong></div>
            <SafetyStatusBadge certified={selected.safetyCertified} />
          </div>
        )}
        <button className="safety-primary-button" type="submit" disabled={busy || !borrowerId}>
          {busy ? <><span className="safety-spinner" aria-hidden="true" /> Saving briefing…</> : 'Record completed briefing'}
        </button>
      </form>
      <p className="safety-footnote">The system stores the borrower, recording staff member, and server timestamp.</p>
    </section>
  );
}
