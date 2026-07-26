import { motion } from 'framer-motion'

export default function PrescriptionForm({ ordonnance, readonly }) {
  if (!ordonnance || ordonnance.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-6 px-4 bg-gray-50 rounded-xl border border-dashed border-gray-200">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-400 mb-2">
          <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/>
          <path d="m8.5 8.5 7 7"/>
        </svg>
        <p className="text-xs text-gray-500 font-medium">Aucune ordonnance générée.</p>
      </div>
    )
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="relative overflow-hidden printable-prescription bg-white rounded-xl">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-white border border-blue-100 rounded-t-xl px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shadow-sm">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/>
              <path d="m8.5 8.5 7 7"/>
            </svg>
          </div>
          <div>
            <h4 className="text-sm font-bold text-gray-800 tracking-tight">Ordonnance Médicale</h4>
            {!readonly ? (
              <p className="text-[0.65rem] text-blue-600 font-semibold uppercase tracking-wider mt-0.5">Brouillon IA • À valider</p>
            ) : (
              <p className="text-[0.65rem] text-green-600 font-semibold uppercase tracking-wider mt-0.5">Validée par l'infirmier(e)</p>
            )}
          </div>
        </div>

        {/* Download Button */}
        {readonly && (
          <button 
            onClick={handlePrint}
            className="no-print flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors shadow-sm cursor-pointer"
            title="Télécharger en PDF"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" x2="12" y1="15" y2="3"/>
            </svg>
            PDF
          </button>
        )}
      </div>

      {/* List of medications */}
      <div className="bg-white border-x border-b border-gray-100 rounded-b-xl p-2 shadow-sm">
        <ul className="flex flex-col gap-1.5">
          {ordonnance.map((item, i) => (
            <motion.li 
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, type: "spring", stiffness: 200, damping: 20 }}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-blue-50/50 transition-colors border border-transparent hover:border-blue-100"
            >
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                <div>
                  <div className="text-[0.8rem] font-bold text-gray-800">{item.medication}</div>
                  <div className="text-[0.65rem] text-gray-500 font-medium mt-0.5">{item.dosage}</div>
                </div>
              </div>
              <div className="bg-white px-2.5 py-1 rounded border border-gray-200 text-[0.65rem] font-bold text-gray-600 shadow-sm">
                {item.duration}
              </div>
            </motion.li>
          ))}
        </ul>
      </div>
      
      {/* Watermark / Stamp effect for validated prescriptions */}
      {readonly && (
        <div className="absolute top-2 right-2 opacity-5 pointer-events-none">
          <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-900">
            <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
            <path d="m9 12 2 2 4-4"/>
          </svg>
        </div>
      )}
    </div>
  )
}
