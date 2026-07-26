import React from 'react'
import { Link } from 'react-router-dom'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Bell, ArrowLeft, Construction } from 'lucide-react'

export default function PlaceholderPage({ title, icon: Icon, color, bg, description, features }) {
  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className={`w-12 h-12 ${bg} rounded-xl flex items-center justify-center`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading text-2xl font-bold text-gray-900">{title}</h1>
            <Badge variant="warning">Së shpejti</Badge>
          </div>
          <p className="text-gray-500 text-sm mt-0.5">{description}</p>
        </div>
      </div>

      <div className="card bg-gradient-to-br from-gray-50 to-white border-dashed border-2 border-gray-200 text-center py-16 mb-6">
        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Construction className="w-8 h-8 text-gray-400" />
        </div>
        <h2 className="font-heading text-xl font-semibold text-gray-700 mb-2">
          Ky modul po ndërtohet...
        </h2>
        <p className="text-gray-500 text-sm max-w-sm mx-auto mb-8">
          Jemi duke punuar intensivisht për ta sjellë sa më shpejt.
          Regjistrohuni për notifikim kur të jetë gati.
        </p>
        <Button className="gap-2">
          <Bell className="w-4 h-4" />
          Njoftomë kur të jetë gati
        </Button>
      </div>

      {features && (
        <div>
          <h3 className="font-heading font-semibold text-gray-700 mb-4">Çfarë do të përfshijë:</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {features.map((f, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className={`w-8 h-8 ${bg} rounded-lg flex items-center justify-center`}>
                  <f.icon className={`w-4 h-4 ${color}`} />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-800">{f.title}</div>
                  <div className="text-xs text-gray-500">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6">
        <Link to="/dashboard">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Kthehu te Dashboard
          </Button>
        </Link>
      </div>
    </div>
  )
}
