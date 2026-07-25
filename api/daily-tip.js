export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { userId, profile } = req.body
  const apiKey = process.env.ANTHROPIC_API_KEY

  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' })
  }

  const prompt = `Gjenero një këshillë praktike dhe konkrete të biznesit (max 2 fjali) për:
Biznesi: ${profile?.business_name || 'e papërcaktuar'}
Industria: ${profile?.industry || 'e papërcaktuar'}
Qyteti: ${profile?.city || 'Shqipëri'}
Sfida: ${profile?.biggest_challenge || 'rritja e biznesit'}

Këshilla duhet të jetë:
- Specifike për industrinë dhe situatën e tyre
- Vepruese — diçka që mund ta bëjnë sot ose këtë javë
- E shkurtër (max 2 fjali)
- Shqip
- Frymëzuese jo negative

Shkruaj vetëm këshillën, pa hyrje.`

  try {
    const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 256,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!anthropicRes.ok) {
      return res.status(500).json({ error: 'AI error' })
    }

    const data = await anthropicRes.json()
    const tip = data.content?.[0]?.text || 'Rishikoni strategjinë tuaj të çmimimit çdo tremujor — bizneset që bëjnë rregullime të vogla rrisin marzhët me 10-15% pa humbur klientë.'

    // Save to Supabase
    if (userId) {
      const { createClient } = await import('@supabase/supabase-js')
      const supabase = createClient(
        process.env.VITE_SUPABASE_URL,
        process.env.VITE_SUPABASE_ANON_KEY
      )
      const today = new Date().toISOString().split('T')[0]
      await supabase.from('daily_tips').insert({
        user_id: userId, content: tip, generated_date: today
      })
    }

    res.json({ tip })
  } catch (err) {
    console.error('Daily tip error:', err)
    res.status(500).json({ error: err.message })
  }
}
