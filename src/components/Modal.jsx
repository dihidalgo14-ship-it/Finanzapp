import React, { useEffect } from 'react'

export default function Modal({ open, onClose, title, subtitle, children, size = 'md' }) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  const sizes = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg', xl: 'max-w-xl' }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className={`w-full ${sizes[size]} bg-white rounded-t-2xl sm:rounded-2xl shadow-mac-modal overflow-hidden`}
           style={{ border: '1px solid rgba(0,0,0,0.08)' }}>
        {(title || subtitle) && (
          <div className="px-6 pt-5 pb-4" style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
            {title && <h2 className="text-[17px] font-semibold text-[#1d1d1f]">{title}</h2>}
            {subtitle && <p className="text-[13px] text-[#86868b] mt-0.5">{subtitle}</p>}
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}
