import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, FileText } from 'lucide-react'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-10 pb-20">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6">
          <ArrowLeft className="w-4 h-4" /> Kthehu
        </Link>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary-500" />
            </div>
            <div>
              <h1 className="font-heading text-2xl font-bold text-gray-900">Kushtet e Shërbimit</h1>
              <p className="text-sm text-gray-400">Hyrë në fuqi: 1 Janar 2025 · Rishikuar: Shtator 2026</p>
            </div>
          </div>

          <div className="prose prose-sm max-w-none text-gray-700 space-y-7">

            <section>
              <h2 className="text-base font-bold text-gray-900 mb-2">1. Pranimi i Kushteve</h2>
              <p>
                Duke aksesuar ose duke përdorur platformën <strong>BiznesiYt.al</strong> (&ldquo;Platforma&rdquo;, &ldquo;Shërbimi&rdquo;),
                ju pranoni të jeni të lidhur nga këto Kushte Shërbimi (&ldquo;Kushtet&rdquo;) dhe nga
                Politika jonë e Privatësisë. Nëse nuk pajtoheni me këto Kushte, ju lutem mos e
                përdorni Platformën.
              </p>
              <p>
                BiznesiYt.al operon në pajtim me legjislacionin shqiptar, përfshirë Ligjin Nr. 9887,
                datë 10.03.2008 &ldquo;Për Mbrojtjen e të Dhënave Personale&rdquo; (i ndryshuar), dhe
                Rregulloren e Përgjithshme të Mbrojtjes së të Dhënave të BE-së (GDPR —
                Rregullorja (EU) 2016/679), e cila zbatohet ndaj operatorëve shqiptarë që
                trajtojnë të dhëna të subjekteve në Zonën Ekonomike Europiane.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-gray-900 mb-2">2. Përshkrimi i Shërbimit</h2>
              <p>
                BiznesiYt.al është një platformë dixhitale që ofron mjete të bazuara në Inteligjencën
                Artificiale (AI) për bizneset e vogla dhe të mesme shqiptare, përfshirë por pa u
                kufizuar në:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Asistencë biznesi dhe këshillim me AI</li>
                <li>Gjenerimin e planeve të marketingut dhe përmbajtjes</li>
                <li>Analizën e konkurrencës</li>
                <li>Mjete financiare dhe fiskale</li>
                <li>Këshillim ligjor orientues (jo zëvendësim i avokatit)</li>
                <li>Mjete për burime njerëzore (HR)</li>
                <li>Plane rritjeje dhe raporte biznesi</li>
              </ul>
              <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg p-3 mt-2">
                ⚠️ <strong>Kufizim i rëndësishëm:</strong> Çdo informacion i gjeneruar nga AI në këtë
                platformë ka natyrë orientuese dhe informuese. Ai nuk përbën këshillë ligjore, fiskale,
                financiare ose profesionale. Konsultohuni gjithmonë me profesionistë të licencuar
                (avokat, kontabilist, konsulent) para se të merrni vendime kritike biznesi.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-gray-900 mb-2">3. Regjistrimi dhe Llogaria</h2>
              <p>
                Për të aksesuar funksionet e plota të Platformës, duhet të krijoni një llogari duke
                dhënë informacion të saktë dhe të plotë. Ju jeni përgjegjës për:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Ruajtjen e konfidencialitetit të kredencialeve tuaja të hyrjes</li>
                <li>Të gjitha aktivitetet që kryhen nën llogarinë tuaj</li>
                <li>Njoftimin e menjëhershëm të BiznesiYt.al në rast aksesi të paautorizuar</li>
              </ul>
              <p>
                Ju duhet të keni të paktën 18 vjeç ose të keni kapacitetin ligjor për të lidhur
                kontrata sipas legjislacionit shqiptar (Kodi Civil, Ligji Nr. 7850/1994) për të
                krijuar një llogari.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-gray-900 mb-2">4. Planet e Abonimit dhe Pagesat</h2>
              <p>
                BiznesiYt.al ofron plane të ndryshme abonimit, duke përfshirë një plan falas me
                funksionalitet të kufizuar. Planet e paguara ofrojnë akses të zgjeruar në funksione
                dhe limite më të larta përdorimi.
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Çmimet shfaqen në faqen e çmimeve dhe mund të ndryshojnë me njoftim paraprak 30-ditor</li>
                <li>Pagesat kryhen sipas modaliteteve të specifikuara gjatë abonimit</li>
                <li>Planet e paguara nuk rimbursohen pas periudhës 14-ditore të tërheqjes (sipas Direktivës BE 2011/83/EU)</li>
                <li>Abonimet ripërtërihen automatikisht përveç nëse anulohen para datës së ripërtëritjes</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-bold text-gray-900 mb-2">5. Kufizime Përdorimi dhe Limitet e Planit</h2>
              <p>
                Çdo plan abonimi ka limite specifike përdorimi (mesazhe AI, plane marketingu, postime,
                analiza). Kur arrini limitin e planit tuaj:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Funksionaliteti i kufizuar do të bllokohet deri në fillim të periudhës tjetër ose ndryshimin e planit</li>
                <li>Do të njoftoheni qartë me mesazh në platformë</li>
                <li>Mund të kontaktoni suportin për zgjerimin e planit tuaj</li>
              </ul>
              <p>
                BiznesiYt.al rezervon të drejtën të ndryshojë limitet e planeve me njoftim paraprak.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-gray-900 mb-2">6. Pronësia Intelektuale</h2>
              <p>
                Të gjitha elementet e Platformës (logo, dizajn, kod, algoritme, bazë të dhënash,
                dokumentacion) janë pronë intelektuale e BiznesiYt.al dhe mbrohen sipas Ligjit
                Nr. 9380/2005 &ldquo;Për të Drejtën e Autorit dhe të Drejtat e Tjera të Lidhura me të&rdquo;.
              </p>
              <p>
                Përmbajtja e gjeneruar nga AI duke përdorur të dhënat tuaja i takon juve si
                përdorues, me kusht që ta përdorni në përputhje me këto Kushte dhe ligjet
                aplikueshme.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-gray-900 mb-2">7. Sjellja e Pranueshme</h2>
              <p>Duke përdorur Platformën, ju pranoni të mos:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Shkelni ndonjë ligj shqiptar ose europian të aplikueshëm</li>
                <li>Ngarkoni ose transmetoni përmbajtje të paligjshme, ofenduese ose mashtruese</li>
                <li>Tentoni të aksesoni sisteme ose të dhëna të paautorizuara</li>
                <li>Përdorni Platformën për aktivitete mashtruese, spamming ose dëmtim të sistemit</li>
                <li>Riprodukoni, shpërndani ose shisni aksesin në Platformë pa autorizim</li>
                <li>Anashkaloni masat teknike të kufizimit të aksesit</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-bold text-gray-900 mb-2">8. Disponueshmëria e Shërbimit</h2>
              <p>
                BiznesiYt.al synon disponueshmëri 99.5% por nuk garanton akses të pandërprerë.
                Shërbimi mund të ndërpritet për mirëmbajtje, përditësime ose për shkak të rrethanave
                jashtë kontrollit tonë (force majeure). Nuk mbajmë përgjegjësi për humbjet e shkaktuara
                nga ndërprerjet e shërbimit.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-gray-900 mb-2">9. Kufizimi i Përgjegjësisë</h2>
              <p>
                Në masën maksimale të lejuar nga ligji shqiptar (Kodi Civil, nenet 624-644 mbi
                dëmshpërblimin):
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>BiznesiYt.al nuk mban përgjegjësi për dëme indirekte, jopasurore ose fitim të humbur</li>
                <li>Përgjegjësia jonë totale nuk do të kalojë shumën e paguar nga ju gjatë 12 muajve të fundit</li>
                <li>Nuk jemi përgjegjës për vendime biznesi të bazuara ekskluzivisht në rekomandimet e AI</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-bold text-gray-900 mb-2">10. Ndryshimet e Kushteve</h2>
              <p>
                BiznesiYt.al rezervon të drejtën të modifikojë këto Kushte me njoftim paraprak
                30-ditor nëpërmjet emailit ose njoftimit në platformë. Vazhdimi i përdorimit pas
                afatit të njoftimit konsiderohet pranim i Kushteve të reja. Nëse nuk pranoni
                ndryshimet, mund të fshini llogarinë tuaj.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-gray-900 mb-2">11. Zgjidhja e Mosmarrëveshjeve</h2>
              <p>
                Këto Kushte rregullohen nga legjislacioni i Republikës së Shqipërisë.
                Çdo mosmarrëveshje që rrjedh nga ose lidhet me këto Kushte do të zgjidhet
                fillimisht nëpërmjet negociatave miqësore. Nëse palët nuk arrijnë marrëveshje
                brenda 30 ditëve, mosmarrëveshja do t&rsquo;i nënshtrohet juridiksionit ekskluziv
                të gjykatave kompetente të Tiranës, Shqipëri.
              </p>
              <p>
                Konsumatorët rezidentë në BE mund të zgjedhin gjithashtu zgjidhjen alternative
                të mosmarrëveshjeve nëpërmjet platformës ODR të Komisionit Europian.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-gray-900 mb-2">12. Kontakti</h2>
              <p>
                Për pyetje mbi këto Kushte, ju lutem na kontaktoni:
              </p>
              <div className="bg-gray-50 rounded-lg p-4 text-sm space-y-1">
                <p><strong>BiznesiYt.al</strong></p>
                <p>Email: info@biznesiytal.al</p>
                <p>Telefon: +355 685 206 564</p>
                <p>WhatsApp: <a href="https://wa.me/355685206564" className="text-primary-600 hover:underline">wa.me/355685206564</a></p>
              </div>
            </section>

          </div>

          <div className="pt-4 border-t border-gray-100 text-xs text-gray-400 text-center">
            © 2025–2026 BiznesiYt.al · Të gjitha të drejtat e rezervuara ·{' '}
            <Link to="/privacy" className="hover:text-gray-600 underline">Politika e Privatësisë</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
