import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export function usePlanLimits() {
  const { user, profile } = useAuth()
  const [limits, setLimits] = useState(null)
  const [usage, setUsage] = useState(null)
  const [planName, setPlanName] = useState('free')
  const [loading, setLoading] = useState(true)

  const fetchLimits = useCallback(async () => {
    if (!user) { setLoading(false); return }
    try {
      const { data, error } = await supabase.rpc('get_my_limits')
      if (error || !data?.[0]) return
      const row = data[0]
      setLimits({
        ai_messages:         row.ai_messages_limit,
        marketing_plans:     row.marketing_plans_limit,
        content_posts:       row.content_posts_limit,
        competitor_analyses: row.competitor_analyses_limit,
      })
      setUsage({
        ai_messages:         row.ai_messages_used         || 0,
        marketing_plans:     row.marketing_plans_used     || 0,
        content_posts:       row.content_posts_used       || 0,
        competitor_analyses: row.competitor_analyses_used || 0,
      })
      setPlanName(row.current_plan || 'free')
    } catch (err) {
      console.error('usePlanLimits:', err)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => { fetchLimits() }, [fetchLimits])

  // Re-fetch when profile changes (plan change by admin)
  useEffect(() => { if (profile?.plan) fetchLimits() }, [profile?.plan])

  function checkLimit(feature) {
    if (!limits) return { allowed: true, remaining: Infinity, limit: null, used: 0 }
    const limit = limits[feature]
    const used = usage?.[feature] || 0
    if (limit === null || limit === undefined) {
      return { allowed: true, remaining: Infinity, limit: null, used }
    }
    const remaining = limit - used
    return { allowed: remaining > 0, remaining: Math.max(0, remaining), limit, used }
  }

  async function incrementUsage(feature) {
    try {
      await supabase.rpc('increment_usage', { feature_key: feature })
      setUsage(prev => prev ? { ...prev, [feature]: (prev[feature] || 0) + 1 } : prev)
    } catch (err) {
      console.error('incrementUsage:', err)
    }
  }

  return { limits, usage, planName, loading, checkLimit, incrementUsage, refetch: fetchLimits }
}
