import FeaturePlaceholder from '../../components/FeaturePlaceholder';

export default function F2Page() {
  return <FeaturePlaceholder number="02" title="Check-out & check-in" description="Help desk staff issue equipment to borrowers, record returns, and keep loan records accurate." requirements={['R04', 'R05', 'R06']} destination="/availability" destinationLabel="Availability" />;
}
