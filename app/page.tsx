import { JourneyWorkbench } from '@/components/journey-workbench';
import { getPolicyCatalog, policyDestinationOptions, policyDocumentOptions } from '@/lib/policy-data';
import type { Locale } from '@/lib/locale';

export const dynamic = 'force-dynamic';

export function HomeView({ locale }: { locale: Locale }) {
  const entries = getPolicyCatalog();
  return <JourneyWorkbench entries={entries} destinations={policyDestinationOptions(locale)} documents={policyDocumentOptions(entries, locale)} today={new Date().toISOString().slice(0, 10)} locale={locale} />;
}

export default function Home() { return <HomeView locale="zh" />; }
