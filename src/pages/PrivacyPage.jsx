import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Shield } from 'lucide-react'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-10 pb-20">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6">
          <ArrowLeft className="w-4 h-4" /> Kthehu
        </Link>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <h1 className="font-heading text-2xl font-bold text-gray-900">Politika e Privatësisë</h1>
              <p className="text-sm text-gray-400">Hyrë në fuqi: 1 Janar 2025 · Rishikuar: Shtator 2026</p>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-800">
            <strong>Bazë ligjore:</strong> Kjo Politikë hartohet në pajtim me Rregulloren (EU) 2016/679
            (GDPR) dhe Ligjin Nr. 9887, datë 10.03.2008 &ldquo;Për Mbrojtjen e të Dhënave Personale&rdquo; të
            Republikës së Shqipërisë, i ndryshuar me Ligjin Nr. 48/2012.
          </div>

          <div className="prose prose-sm max-w-none text-gray-700 space-y-7">

            <section>
              <h2 className="text-base font-bold text-gray-900 mb-2">1. Operatori i të Dhënave</h2>
              <p>
                Operator i të dhënave tuaja personale është <strong>BiznesiYt.al</strong>, i arritshëm
                në adresën elektronike <strong>info@biznesiytal.al</strong> dhe me numër telefoni
                <strong> +355 685 206 564</strong>.
              </p>
              <p>
                Për çdo çështje që lidhet me mbrojtjen e të dhënave tuaja personale, mund të na
                kontaktoni direkt nëpërmjet kanaleve të mësipërme.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-gray-900 mb-2">2. Të Dhënat që Mbledhim</h2>
              <p>Mbledhim llojet e mëposhtme të të dhënave:</p>

              <h3 className="text-sm font-semibold text-gray-800 mt-3 mb-1">2.1 Të dhëna të dhëna drejtpërdrejt nga ju:</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Emri i plotë dhe email-i (i domosdoshëm për regjistrim)</li>
                <li>Emri i biznesit, industria, qyteti dhe të dhëna operative (vitet, punonjësit, xhiroja)</li>
                <li>Foto profili (opsionale)</li>
                <li>Sfidat e biznesit dhe objektivat e deklaruara</li>
                <li>Të dhënat e pagimit (të dhënat e kartës ruhën vetëm nga ofruesi i pagesave — ne nuk ruajmë numra kartash)</li>
              </ul>

              <h3 className="text-sm font-semibold text-gray-800 mt-3 mb-1">2.2 Të dhëna të gjeneruara automatikisht:</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Adresa IP dhe lloji i shfletuesit (për siguri dhe diagnostikim)</li>
                <li>Data dhe ora e hyrjeve në sistem</li>
                <li>Statistikat e përdorimit të funksioneve (numri i mesazheve AI, planeve etj.)</li>
                <li>Bisedat me asistentin AI (për të përmirësuar shërbimin)</li>
                <li>Preferencat e ndërfaqes (tema, gjuha)</li>
              </ul>

              <h3 className="text-sm font-semibold text-gray-800 mt-3 mb-1">2.3 Të dhëna nga palë të treta:</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Nëse regjistroheni nëpërmjet Google ose ofrues të tjerë OAuth, marrim emrin dhe email-in nga ata ofrues</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-bold text-gray-900 mb-2">3. Si i Përdorim të Dhënat</h2>
              <p>Të dhënat tuaja personale përdoren për:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Ekzekutimi i kontratës (Neni 6(1)(b) GDPR):</strong> Ofrimi i shërbimeve të Platformës, menaxhimi i llogarisë, procesimi i pagesave</li>
                <li><strong>Interesi legjitim (Neni 6(1)(f) GDPR):</strong> Siguria e platformës, parandalimi i abuzimit, statistika agregate të anonimizuara</li>
                <li><strong>Detyrim ligjor (Neni 6(1)(c) GDPR):</strong> Pajtueshmëria me ligjin tatimor shqiptar dhe kërkesat ligjore</li>
                <li><strong>Pëlqimi (Neni 6(1)(a) GDPR):</strong> Dërgimi i komunikimeve marketing (vetëm nëse keni pranuar shprehimisht)</li>
              </ul>
              <p className="mt-2">
                Bisedat tuaja me asistentin AI personalizohen duke përdorur profilin e biznesit tuaj
                për të ofruar këshilla relevante. <strong>Ne nuk i shesim të dhënat tuaja palëve të treta.</strong>
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-gray-900 mb-2">4. Ruajtja e të Dhënave</h2>
              <p>
                Të dhënat tuaja personale ruhen në serverat e <strong>Supabase</strong> (Europë — Frankfurt, Gjermani),
                brenda Bashkimit Europian, në pajtim me kërkesat e GDPR për transferimet e të dhënave.
              </p>
              <p>Periudhat e ruajtjes:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Të dhënat e llogarisë aktive:</strong> Derisa të fshini llogarinë tuaj</li>
                <li><strong>Bisedat AI:</strong> 24 muaj nga data e krijimit, me opsion fshirjeje manuale</li>
                <li><strong>Të dhënat e pagesave (regjistrat):</strong> 10 vjet sipas Ligjit Nr. 9228/2004 &ldquo;Për Kontabilitetin dhe Pasqyrat Financiare&rdquo;</li>
                <li><strong>Regjistrat teknikë:</strong> 90 ditë</li>
                <li><strong>Pas fshirjes së llogarisë:</strong> Të dhënat fshihen brenda 30 ditëve, me përjashtim të detyrimeve ligjore</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-bold text-gray-900 mb-2">5. Ndarja e të Dhënave me Palë të Treta</h2>
              <p>
                Ne ndajmë të dhëna minimale vetëm me ofruesit e shërbimeve të domosdoshëm (&ldquo;nënprocesuesit&rdquo;):
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse mt-2">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-200 px-3 py-2 text-left font-semibold">Ofruesi</th>
                      <th className="border border-gray-200 px-3 py-2 text-left font-semibold">Qëllimi</th>
                      <th className="border border-gray-200 px-3 py-2 text-left font-semibold">Vendndodhja</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td className="border border-gray-200 px-3 py-2">Supabase</td><td className="border border-gray-200 px-3 py-2">Bazë të dhënash dhe autentifikim</td><td className="border border-gray-200 px-3 py-2">BE (Frankfurt)</td></tr>
                    <tr><td className="border border-gray-200 px-3 py-2">Anthropic (Claude AI)</td><td className="border border-gray-200 px-3 py-2">Gjenerimi i përmbajtjes AI</td><td className="border border-gray-200 px-3 py-2">SHBA (SCCs)</td></tr>
                    <tr><td className="border border-gray-200 px-3 py-2">Cloudflare / CDN</td><td className="border border-gray-200 px-3 py-2">Serverim dhe siguri</td><td className="border border-gray-200 px-3 py-2">BE</td></tr>
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                SCCs = Klauzolat Standarde Kontraktuale të BE-së për transferime të dhënash jashtë BE-së (Neni 46 GDPR).
              </p>
              <p>
                Nuk shesim, jepim me qira ose ndajmë të dhëna personale me kompani reklamimi ose palë
                të treta tregtare. Mund t&rsquo;u zbulojmë të dhëna autoriteteve kompetente vetëm kur
                detyrohemi nga ligji shqiptar.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-gray-900 mb-2">6. Të Drejtat Tuaja si Subjekt i të Dhënave</h2>
              <p>
                Sipas GDPR (Kapitujt III–IV) dhe Ligjit Nr. 9887/2008 (nenet 8–16), keni të drejtat
                e mëposhtme, të cilat mund t&rsquo;i ushtroni brenda 30 ditëve nga kërkesa:
              </p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li><strong>E drejta e aksesit (Neni 15 GDPR):</strong> Të merrni kopje të të dhënave tuaja — eksportoni direkt nga <em>Cilësimet → Privatësia → Eksporto të dhënat</em></li>
                <li><strong>E drejta e korrigjimit (Neni 16 GDPR):</strong> Të korrigjoni të dhëna të pasakta — ndryshoni direkt nga <em>Cilësimet</em></li>
                <li><strong>E drejta e fshirjes (&ldquo;të harrohesh&rdquo;) (Neni 17 GDPR):</strong> Të kërkoni fshirjen e të dhënave — fshini llogarinë nga <em>Cilësimet → Fshi Llogarinë</em></li>
                <li><strong>E drejta e kufizimit të trajtimit (Neni 18 GDPR):</strong> Të kufizoni trajtimin gjatë periudhave të mosmarrëveshjes</li>
                <li><strong>E drejta e portabilitetit (Neni 20 GDPR):</strong> Të merrni të dhënat në format të strukturuar (JSON) — eksportoni nga <em>Cilësimet</em></li>
                <li><strong>E drejta e kundërshtimit (Neni 21 GDPR):</strong> Të kundërshtoni trajtimin për qëllime interesi legjitim</li>
                <li><strong>E drejta e tërheqjes së pëlqimit (Neni 7(3) GDPR):</strong> Të tërhiqni pëlqimin për komunikime marketing në çdo kohë</li>
              </ul>
              <p className="mt-2">
                Për të ushtruar të drejtat e mësipërme, na kontaktoni te <strong>info@biznesiytal.al</strong>.
                Nëse besoni se trajtimi i të dhënave tuaja ka shkelur GDPR, keni të drejtë të paraqisni
                ankesë te <strong>Komisioneri për të Drejtën e Informimit dhe Mbrojtjen e të Dhënave
                Personale (IDP)</strong> të Shqipërisë, ose te autoriteti mbikëqyrës i vendit tuaj të BE-së.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-gray-900 mb-2">7. Sigurinë e të Dhënave</h2>
              <p>
                Zbatojmë masa teknike dhe organizative adekuate sipas Nenit 32 GDPR dhe nenit 27
                të Ligjit Nr. 9887/2008, duke përfshirë:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Enkriptim TLS/HTTPS për të gjitha transmetimet</li>
                <li>Enkriptim i të dhënave në pushim (at rest) në bazën e të dhënave</li>
                <li>Autentifikim me fjalëkalim të hashuar (bcrypt)</li>
                <li>Kontrolle aksesi të bazuara në role (Row Level Security)</li>
                <li>Monitorim i vazhdueshëm dhe regjistrim i ngjarjeve të sigurisë</li>
                <li>Kopje rezervë të rregullta (backup) të enkriptuara</li>
              </ul>
              <p className="mt-2">
                Në rast të shkeljes së të dhënave që rrezikon të drejtat tuaja, do t&rsquo;ju njoftojmë
                brenda 72 orëve sipas Nenit 33–34 GDPR.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-gray-900 mb-2">8. Cookies dhe Teknologjitë e Gjurmimit</h2>
              <p>
                BiznesiYt.al përdor vetëm cookies teknikisht të domosdoshme (sesion, autentifikim,
                preferencë teme) që nuk kërkojnë pëlqim sipas Direktivës ePrivacy 2002/58/EC dhe
                zbatimit të saj shqiptar. Nuk përdorim cookies reklamuese ose analitike të palëve
                të treta.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-gray-900 mb-2">9. Të Dhënat e Fëmijëve</h2>
              <p>
                Platforma nuk u drejtohet personave nën 18 vjeç. Nëse zbulojmë se kemi mbledhur
                të dhëna personale të fëmijëve pa pëlqimin prindëror, do t&rsquo;i fshijmë ato
                menjëherë. Prindërit mund të na kontaktojnë te info@biznesiytal.al.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-gray-900 mb-2">10. Ndryshimet e Politikës</h2>
              <p>
                Mund ta azhurnojmë këtë Politikë Privatësie periodikisht. Çdo ndryshim i rëndësishëm
                do t&rsquo;ju njoftohet nëpërmjet email-it ose njoftimit në platformë të paktën 30 ditë
                para hyrjes në fuqi. Versioni i fundit është gjithmonë i disponueshëm në
                <strong> biznesiytal.al/privacy</strong>.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-gray-900 mb-2">11. Kontakti dhe Ankesat</h2>
              <div className="bg-gray-50 rounded-lg p-4 text-sm space-y-1">
                <p><strong>BiznesiYt.al — Oficer i Mbrojtjes së të Dhënave</strong></p>
                <p>Email: info@biznesiytal.al</p>
                <p>Telefon / WhatsApp: +355 685 206 564</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 text-sm space-y-1 mt-3">
                <p><strong>Autoriteti mbikëqyrës shqiptar:</strong></p>
                <p>Komisioneri për të Drejtën e Informimit dhe Mbrojtjen e të Dhënave Personale (IDP)</p>
                <p>Web: <span className="text-blue-600">idp.al</span> · Email: info@idp.al</p>
              </div>
            </section>

          </div>

          <div className="pt-4 border-t border-gray-100 text-xs text-gray-400 text-center">
            © 2025–2026 BiznesiYt.al ·{' '}
            <Link to="/terms" className="hover:text-gray-600 underline">Kushtet e Shërbimit</Link>
            {' '}· Bazuar në GDPR (EU) 2016/679 dhe Ligjin Nr. 9887/2008
          </div>
        </div>
      </div>
    </div>
  )
}
