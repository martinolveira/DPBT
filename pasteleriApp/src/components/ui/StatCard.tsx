interface StatCardProps {
  label: string
  value: string | number
  sub?: string
  alert?: boolean
}

export function StatCard({ label, value, sub, alert = false }: StatCardProps) {
  return (
    <div className={`bg-white rounded-xl p-5 border ${alert ? 'border-amber-200 bg-amber-50' : 'border-warm-200'}`}>
      <p className="text-xs font-semibold uppercase tracking-wide text-warm-500 mb-1">{label}</p>
      <p className="text-3xl font-bold text-warm-800">{value}</p>
      {sub && <p className="text-xs text-warm-500 mt-1">{sub}</p>}
    </div>
  )
}
