import { JourneyWorkbench } from '@/components/journey-workbench';
import { getPolicyCatalog, policyDestinations } from '@/lib/policy-data';

export const dynamic = 'force-dynamic';

export default function Home() {
  const entries = getPolicyCatalog();
  const documents = [...new Map(entries.map((entry) => [entry.documentKey, entry.documentName])).entries()]
    .map(([id, label]) => ({ id, label }));
  return <JourneyWorkbench entries={entries} destinations={policyDestinations} documents={documents} today={new Date().toISOString().slice(0, 10)} />;
}
