export default function UrgencyBadge({ level }) {
  const isRed = level === 'red' || level === 'rouge'
  const isOrange = level === 'orange'
  const isGreen = level === 'green' || level === 'vert' || !level

  const label = isRed ? 'Alerte CHR (Rouge)' : isOrange ? 'Suivi Rapproché (Orange)' : 'Physiologique (Vert)'
  
  return (
    <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold inline-flex items-center gap-1.5 shadow-sm ${
      isRed
        ? 'bg-red-100 text-red-700 border border-red-200'
        : isOrange
        ? 'bg-amber-100 text-amber-800 border border-amber-200'
        : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
    }`}>
      <span className={`w-1.5 h-1.5 rounded-full ${
        isRed ? 'bg-red-600 animate-pulse' : isOrange ? 'bg-amber-600' : 'bg-emerald-600'
      }`} />
      {label}
    </span>
  )
}
