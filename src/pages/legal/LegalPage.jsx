import React from 'react'
import PlaceholderPage from '../PlaceholderPage'
import { Scale, BookOpen, FileText, Calendar } from 'lucide-react'

export default function LegalPage() {
  return (
    <PlaceholderPage
      title="Ligjore & Fiskal"
      icon={Scale}
      color="text-purple-500"
      bg="bg-purple-50"
      description="Pyetje ligjore, template dokumentash dhe kalendarë fiskal"
      features={[
        { icon: BookOpen, title: "Pyetje & Përgjigje", desc: "Bazë dijesh ligjore" },
        { icon: FileText, title: "Template Dokumentash", desc: "Kontrata dhe formularë" },
        { icon: Calendar, title: "Kalendarë Fiskal", desc: "Afatet e TVSH-së dhe tatimit" },
        { icon: Scale, title: "Guidë NIPT", desc: "Regjistrim dhe detyrime" },
      ]}
    />
  )
}
