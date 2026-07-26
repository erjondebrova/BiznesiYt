import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { Button } from '../components/ui/button'
import { Textarea } from '../components/ui/textarea'
import {
  Send, Plus, MessageSquare, Trash2, Menu, X,
  Bot, User, Sparkles, ChevronLeft
} from 'lucide-react'
import { cn } from '../lib/utils'
import { usePlanLimits } from '../hooks/usePlanLimits'
import LimitReachedPopup from '../components/LimitReachedPopup'

const SUGGESTED_PROMPTS = [
  "Si mund të rris shitjet këtë muaj?",
  "Çfarë strategjie marketingu rekomandoni për biznesin tim?",
  "Si të llogarisim çmimin e duhur të produktit?",
  "Çfarë duhet të deklaroj për TVSH-në këtë tremujor?",
  "Si të gjej financim për të zgjeruar biznesin?",
  "Analizoni konkurrencën time dhe jepni rekomandime",
]

function buildSystemPrompt(profile) {
  if (!profile) return `Ti je këshilltari i biznesit në platformën BiznesiYt.al. Fol gjithmonë shqip. Jep këshilla konkrete dhe vepruese.`

  return `Ti je këshilltari i biznesit në platformën BiznesiYt.al.
Përdoruesi ka këtë profil biznesi:
- Biznesi: ${profile.business_name || 'E papërcaktuar'}
- Industria: ${profile.industry || 'E papërcaktuar'}
- Qyteti: ${profile.city || 'E papërcaktuar'}
- Vitet: ${profile.years_operating || 'E papërcaktuar'}
- Punonjës: ${profile.employee_count || 'E papërcaktuar'}
- Xhiroja mujore: ${profile.monthly_revenue_range || 'E papërcaktuar'}
- Ka NIPT: ${profile.has_nipt ? 'Po' : 'Jo'}
- Sfida kryesore: ${profile.biggest_challenge || 'E papërcaktuar'}

Rregullat:
1. Fol gjithmonë shqip
2. Jep këshilla KONKRETE dhe VEPRUESE — jo teori abstrakte
3. Përdor emrin e biznesit dhe detajet specifike të profilit
4. Kur pyetja lidhet me një modul specifik, thuaj "Shko te moduli [X] për një analizë më të thellë"
5. Ji si një shok ekspert — profesional por miqësor
6. Kur nuk je i sigurt, thuaje qartë — mos shpik të dhëna
7. Për çështje ligjore/fiskale, shto: "⚠️ Konsultohuni me profesionist për rastin tuaj specifik"
8. Përdor emoji me moderim për të bërë tekstin më të lexueshëm
9. Strukturo përgjigjet me tituj dhe lista kur ka shumë informacion`
}

function TypingIndicator() {
  return (
    <div className="flex items-start gap-3 chat-message">
      <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center flex-shrink-0">
        <Bot className="w-4 h-4 text-white" />
      </div>
      <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot" />
          <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot" />
          <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot" />
        </div>
      </div>
    </div>
  )
}

function Message({ msg }) {
  const isUser = msg.role === 'user'
  return (
    <div className={cn("flex items-start gap-3 chat-message", isUser && "flex-row-reverse")}>
      <div className={cn(
        "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
        isUser ? "bg-secondary-500" : "bg-primary-500"
      )}>
        {isUser ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
      </div>
      <div className={cn(
        "max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
        isUser
          ? "bg-primary-500 text-white rounded-tr-sm"
          : "bg-white border border-gray-100 text-gray-800 rounded-tl-sm shadow-sm"
      )}>
        <div className="whitespace-pre-wrap">{msg.content}</div>
      </div>
    </div>
  )
}

export default function ChatPage() {
  const { id } = useParams()
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const { checkLimit, incrementUsage } = usePlanLimits()
  const [conversations, setConversations] = useState([])
  const [currentConv, setCurrentConv] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [streamingText, setStreamingText] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [limitPopup, setLimitPopup] = useState(null)
  const messagesEndRef = useRef(null)
  const textareaRef = useRef(null)
  const abortRef = useRef(null)

  useEffect(() => { loadConversations() }, [user?.id])
  useEffect(() => { if (id) loadConversation(id) }, [id])
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, streamingText])

  async function loadConversations() {
    if (!user?.id) return
    const { data } = await supabase.from('conversations').select('*')
      .eq('user_id', user.id).order('updated_at', { ascending: false }).limit(20)
    setConversations(data || [])
  }

  async function loadConversation(convId) {
    const { data: conv } = await supabase.from('conversations').select('*').eq('id', convId).single()
    if (conv) setCurrentConv(conv)
    const { data: msgs } = await supabase.from('messages').select('*')
      .eq('conversation_id', convId).order('created_at')
    setMessages(msgs || [])
  }

  async function createNewConversation() {
    if (!user?.id) return
    const { data } = await supabase.from('conversations').insert({
      user_id: user.id, module: 'general', title: 'Bisedë e re'
    }).select().single()
    if (data) {
      setCurrentConv(data)
      setMessages([])
      loadConversations()
      navigate(`/chat/${data.id}`)
    }
  }

  async function deleteConversation(convId, e) {
    e.preventDefault()
    e.stopPropagation()
    await supabase.from('messages').delete().eq('conversation_id', convId)
    await supabase.from('conversations').delete().eq('id', convId)
    if (currentConv?.id === convId) {
      setCurrentConv(null)
      setMessages([])
      navigate('/chat')
    }
    loadConversations()
  }

  async function sendMessage() {
    if (!input.trim() || streaming) return

    const { allowed, used, limit } = checkLimit('ai_messages')
    if (!allowed) {
      setLimitPopup({ feature: 'ai_messages', used, limit })
      return
    }

    const text = input.trim()
    setInput('')

    let conv = currentConv
    if (!conv) {
      const { data } = await supabase.from('conversations').insert({
        user_id: user.id, module: 'general',
        title: text.slice(0, 60)
      }).select().single()
      conv = data
      setCurrentConv(conv)
      loadConversations()
      navigate(`/chat/${conv.id}`, { replace: true })
    }

    const userMsg = { role: 'user', content: text, id: Date.now() }
    setMessages(prev => [...prev, userMsg])

    await supabase.from('messages').insert({
      conversation_id: conv.id, role: 'user', content: text
    })

    setStreaming(true)
    setStreamingText('')

    const history = [...messages, userMsg].map(m => ({ role: m.role, content: m.content }))

    try {
      const controller = new AbortController()
      abortRef.current = controller

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          messages: history,
          systemPrompt: buildSystemPrompt(profile),
        }),
      })

      if (!res.ok) throw new Error('API error')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let fullText = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n').filter(l => l.startsWith('data: '))
        for (const line of lines) {
          const data = line.slice(6)
          if (data === '[DONE]') break
          try {
            const parsed = JSON.parse(data)
            const delta = parsed.delta?.text || parsed.choices?.[0]?.delta?.content || ''
            if (delta) {
              fullText += delta
              setStreamingText(fullText)
            }
          } catch {}
        }
      }

      const assistantMsg = { role: 'assistant', content: fullText, id: Date.now() + 1 }
      setMessages(prev => [...prev, assistantMsg])
      setStreamingText('')
      if (fullText) await incrementUsage('ai_messages')

      await supabase.from('messages').insert({
        conversation_id: conv.id, role: 'assistant', content: fullText
      })

      if (messages.length === 0) {
        const title = text.slice(0, 60)
        await supabase.from('conversations').update({ title, updated_at: new Date().toISOString() }).eq('id', conv.id)
        setCurrentConv(prev => ({ ...prev, title }))
        loadConversations()
      } else {
        await supabase.from('conversations').update({ updated_at: new Date().toISOString() }).eq('id', conv.id)
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        const errMsg = { role: 'assistant', content: 'Ndodhi një gabim. Ju lutem provoni sërish.', id: Date.now() }
        setMessages(prev => [...prev, errMsg])
      }
      setStreamingText('')
    } finally {
      setStreaming(false)
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const ConversationList = () => (
    <div className="h-full flex flex-col bg-white border-r border-gray-100">
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-heading font-semibold text-gray-900 text-sm">Bisedat</h2>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden p-1 rounded-lg hover:bg-gray-100">
            <X className="w-4 h-4" />
          </button>
        </div>
        <Button onClick={createNewConversation} size="sm" className="w-full gap-2">
          <Plus className="w-4 h-4" />
          Bisedë e Re
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {conversations.length === 0 && (
          <div className="text-center text-xs text-gray-400 py-6">Nuk ka biseda</div>
        )}
        {conversations.map(c => (
          <div key={c.id}
            onClick={() => { navigate(`/chat/${c.id}`); setSidebarOpen(false) }}
            className={cn(
              "flex items-center gap-2 p-3 rounded-xl cursor-pointer group transition-colors",
              currentConv?.id === c.id ? "bg-primary-50" : "hover:bg-gray-50"
            )}>
            <MessageSquare className={cn("w-4 h-4 flex-shrink-0", currentConv?.id === c.id ? "text-primary-500" : "text-gray-400")} />
            <span className="flex-1 text-xs font-medium text-gray-700 truncate">{c.title || 'Bisedë e re'}</span>
            <button onClick={(e) => deleteConversation(c.id, e)}
              className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 transition-all">
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <div className="h-full flex overflow-hidden">
      {limitPopup && <LimitReachedPopup {...limitPopup} onClose={() => setLimitPopup(null)} />}
      {/* Desktop sidebar */}
      <div className="hidden md:flex w-60 lg:w-64 flex-col flex-shrink-0">
        <ConversationList />
      </div>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/30" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-72 shadow-modal z-10">
            <ConversationList />
          </div>
        </div>
      )}

      {/* Chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Chat header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-white flex-shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="md:hidden p-1.5 rounded-lg hover:bg-gray-100">
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
          <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="font-heading font-semibold text-gray-900 text-sm">Këshilltari AI</div>
            <div className="text-xs text-green-500 flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
              Online
            </div>
          </div>
          <div className="ml-auto">
            <Button variant="ghost" size="sm" onClick={createNewConversation} className="gap-1.5 text-xs">
              <Plus className="w-3.5 h-3.5" />
              E Re
            </Button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {!currentConv && messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center mb-4">
                <Sparkles className="w-8 h-8 text-primary-500" />
              </div>
              <h3 className="font-heading text-lg font-semibold text-gray-900 mb-2">
                Mirë se erdhët!
              </h3>
              <p className="text-gray-500 text-sm max-w-xs mb-8">
                Jam këshilltari juaj AI i biznesit. Pyesni çdo gjë lidhur me{' '}
                {profile?.business_name ? profile.business_name : 'biznesin tuaj'}.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-lg w-full">
                {SUGGESTED_PROMPTS.map(p => (
                  <button key={p} onClick={() => setInput(p)}
                    className="text-left px-4 py-3 bg-white border border-gray-200 rounded-xl text-xs text-gray-700 hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700 transition-all">
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map(msg => <Message key={msg.id} msg={msg} />)}
          {streaming && streamingText && (
            <div className="flex items-start gap-3 chat-message">
              <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="max-w-[75%] bg-white border border-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm text-sm text-gray-800 whitespace-pre-wrap">
                {streamingText}
                <span className="inline-block w-1 h-4 bg-primary-500 ml-1 animate-pulse" />
              </div>
            </div>
          )}
          {streaming && !streamingText && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-100 bg-white flex-shrink-0">
          {messages.length > 0 && !streaming && (
            <div className="flex gap-2 mb-3 overflow-x-auto pb-1 scrollbar-none">
              {SUGGESTED_PROMPTS.slice(0, 3).map(p => (
                <button key={p} onClick={() => setInput(p)}
                  className="text-xs text-gray-500 border border-gray-200 rounded-full px-3 py-1 hover:border-primary-300 hover:text-primary-600 transition-colors whitespace-nowrap flex-shrink-0">
                  {p.slice(0, 35)}...
                </button>
              ))}
            </div>
          )}
          <div className="flex gap-2 items-end">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Pyesni çdo gjë lidhur me biznesin tuaj..."
              rows={1}
              className="flex-1 resize-none max-h-32 min-h-[44px]"
              disabled={streaming}
            />
            <Button onClick={sendMessage} disabled={!input.trim() || streaming} size="icon"
              className="h-11 w-11 flex-shrink-0">
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-gray-400 mt-2 text-center">
            AI mund të bëjë gabime. Konsultohuni me profesionist për vendime të rëndësishme.
          </p>
        </div>
      </div>
    </div>
  )
}
