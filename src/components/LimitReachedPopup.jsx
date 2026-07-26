import React from 'react'
import { X, Phone, MessageCircle, AlertCircle } from 'lucide-react'

const FEATURE_LABELS = {
  ai_messages:         'Mesazhe AI',
  marketing_plans:     'Plane Marketingu',
  content_posts:       'Postime Përmbajtjesh',
  competitor_analyses: 'Analiza Konkurrence',
}

export default function LimitReachedPopup({ feature, used, limit, onClose }) {
  const label = FEATURE_LABELS[feature] || feature
  const pct = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 100

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl max-w-sm w-full p-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-100 text-gray-400"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-6 h-6 text-red-500" />
          </div>
          <div>
            <h2 className="font-heading font-bold text-gray-900">Limit i arritur</h2>
            <p className="text-sm text-gray-500">{label}</p>
          </div>
        </div>

        <div className="mb-5">
          <div className="flex justify-between text-xs text-gray-500 mb-1.5">
            <span>Përdorur</span>
            <span className="font-medium">{used} / {limit}</span>
          </div>
          <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-red-500 rounded-full" style={{ width: `${pct}%` }} />
          </div>
        </div>

        <p className="text-sm text-gray-600 mb-5 text-center leading-relaxed">
          Keni arritur limitin e planit tuaj për{' '}
          <strong>{label.toLowerCase()}</strong>.{' '}
          Kontaktoni administratorin për të zgjeruar planin tuaj.
        </p>

        <div className="space-y-3">
          <a
            href="tel:+355685206564"
            className="flex items-center justify-center gap-2.5 w-full bg-primary-500 hover:bg-primary-600 text-white py-3 rounded-xl font-medium text-sm transition-colors"
          >
            <Phone className="w-4 h-4" />
            +355 685 206 564
          </a>
          <a
            href="https://wa.me/355685206564"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2.5 w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-medium text-sm transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            WhatsApp
          </a>
        </div>
      </div>
    </div>
  )
}
