import { PageHeader } from '../../components/ui/page-header';
import { Card } from '../../components/ui/card';

export default function DashboardPage() {
  return (
    <>
      <PageHeader title="Dashboard" description="Family overview and recent activity." />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Family members', value: '—' },
          { label: 'Archived', value: '—' },
          { label: 'Events', value: '—' },
          { label: 'Important dates', value: '—' },
        ].map((item) => (
          <Card key={item.label}>
            <p className="text-sm text-slate-500">{item.label}</p>
            <p className="mt-3 text-3xl font-bold text-slate-900">{item.value}</p>
          </Card>
        ))}
      </div>
    </>
  );
}
