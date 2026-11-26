import FeaturePlaceholder from '../../components/FeaturePlaceholder';

export default function F3Page() {
  return <FeaturePlaceholder number="03" title="Item status & tracking" description="See the current status and location of makerspace equipment as it moves through the lending workflow." requirements={['R07', 'R08', 'R09']} destination="/desk" destinationLabel="Check-out & check-in" />;
}
