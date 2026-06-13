interface StatCardProps {
  label: string;
  value: number;
  accent?: string;
}

export default function StatCard({ label, value, accent = "bg-red-50 text-red-700" }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-slate-500">{label}</p>
      <p className={`mt-2 inline-flex rounded-lg px-3 py-1 text-2xl font-bold ${accent}`}>
        {value}
      </p>
    </div>
  );
}
