export default function DashboardLoading() {
  return <div className="p-4 sm:p-6 lg:p-8" aria-busy="true">
    <p role="status" className="mb-6 text-sm font-semibold text-slate-700">Overzicht laden…</p>
    <div aria-hidden="true" className="space-y-5">
      <div className="h-8 w-2/3 rounded-lg bg-slate-200" />
      <div className="h-48 rounded-2xl border border-slate-200 bg-white" />
      <div className="grid grid-cols-2 gap-4"><div className="h-28 rounded-xl bg-slate-200" /><div className="h-28 rounded-xl bg-slate-200" /></div>
    </div>
  </div>;
}
