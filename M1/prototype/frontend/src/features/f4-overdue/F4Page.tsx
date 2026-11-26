import FeaturePlaceholder from '../../components/FeaturePlaceholder';

export default function F4Page() {
  return <FeaturePlaceholder number="04" title="Overdue handling" description="Review loans past their due date and follow up with borrowers so shared equipment can return to the workshop." requirements={['R10', 'R11', 'R12']} destination="/tracking" destinationLabel="Item tracking" />;
}
