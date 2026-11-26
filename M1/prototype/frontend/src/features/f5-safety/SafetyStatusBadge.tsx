export function SafetyStatusBadge({ certified }: { certified: boolean }) {
  return (
    <span className={`safety-badge ${certified ? 'is-certified' : 'is-uncertified'}`}>
      <span className="safety-badge-dot" aria-hidden="true" />
      {certified ? 'Certified' : 'Not certified'}
    </span>
  );
}
