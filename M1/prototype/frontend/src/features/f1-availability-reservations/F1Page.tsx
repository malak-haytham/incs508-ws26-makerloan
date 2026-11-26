import FeaturePlaceholder from '../../components/FeaturePlaceholder';

export default function F1Page() {
  return <FeaturePlaceholder number="01" title="Availability & reservations" description="Find equipment in the makerspace and reserve an available item for your next project." requirements={['R01', 'R02', 'R03']} destination="/safety" destinationLabel="Safety briefings" />;
}
