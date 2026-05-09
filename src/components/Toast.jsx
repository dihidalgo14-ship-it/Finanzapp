import React, { useState, useEffect } from 'react'
import { CheckCircle, AlertCircle, Info } from 'lucide-react'

let toastFn = null
export function showToast(msg, type = 'success') {
  if (toastFn) toastFn(msg, type)
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState([])
  useEffect(() => {
    toastFn = (msg, type) => {
      const id = Date.now()
      setToasts(p => [...p, { id, msg, type }])
      setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3000)
    }
    return () => { toastFn = null }
  }, [])
  const icons = {
    success: <CheckCircle size={15} className="text-[#34c759] shrink-0" />,
    error: <AlertCircle size={15} className="text-[#ff3b30] shrink-0" />,
    info: <Info size={15} className="text-[#0071e3] shrink-0" />,
  }
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 pointer-events-none items-center">
      {toasts.map(t => (
        <div key={t.id} className="flex items-center gap-2 px-4 py-2.5 bg-white rounded-full text-[13px] text-[#1d1d1f] shadow-mac-lg"
             style={{ border: '1px solid rgba(0,0,0,0.08)' }}>
          {icons[t.type]}
          <span>{t.msg}</span>
        </div>
      ))}
    </div>
  )
}
