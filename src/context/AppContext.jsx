import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { sb } from '../lib/supabase'
import { CATALOGO_BASE, USERS } from '../lib/config'
import { eKey } from '../lib/utils'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  // ── Produtos & catálogo ──────────────────────────────────────────────────
  const [produtosDB, setProdutosDB] = useState([])
  const [estoqueMap, setEstoqueMap] = useState({})
  const [catalogo, setCatalogo]     = useState(CATALOGO_BASE)
  const [configData, setConfigData] = useState({})
  const [loading, setLoading]       = useState(true)

  // ── Refs estáveis para evitar loops de dependência ────────────────────────
  // configData como ref → carregarProdutos pode lê-la sem entrar nas deps
  const configDataRef = useRef({})
  const rtRef         = useRef([])

  // Mantém a ref sincronizada com o state
  useEffect(() => {
    configDataRef.current = configData
  }, [configData])

  // ── Carrinho ──────────────────────────────────────────────────────────────
  const [cart, setCart] = useState([])

  // ── Auth ──────────────────────────────────────────────────────────────────
  const [currentUser, setCurrentUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('wvpod_user')) } catch { return null }
  })

  // ── Toast ─────────────────────────────────────────────────────────────────
  const [toasts, setToasts] = useState([])
  const toast = useCallback((msg, icon = '✓') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, msg, icon }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3200)
  }, [])

  // ── carregarPrecosSalvos ──────────────────────────────────────────────────
  // Retorna o cfg para quem chama poder passar adiante — evita race condition
  const carregarPrecosSalvos = useCallback(async (catalogoBase) => {
    try {
      const { data } = await sb.from('config').select('*')
      const cfg = {}
      ;(data || []).forEach(row => { cfg[row.chave] = row.valor })

      // Atualiza ref imediatamente (antes do próximo render)
      configDataRef.current = cfg
      setConfigData(cfg)

      // Aplica preços e descs no catálogo base
      setCatalogo(
        (catalogoBase || CATALOGO_BASE).map(cat => ({
          ...cat,
          preco: cfg[cat.linha] != null ? parseFloat(cfg[cat.linha]) : cat.preco,
          desc:  cfg[`desc:${cat.linha}`] || cat.desc,
        }))
      )
      return cfg
    } catch (e) {
      console.error('config:', e)
      return {}
    }
  }, []) // ← sem dependências → função nunca recriada

  // ── carregarProdutos ──────────────────────────────────────────────────────
  // Usa configDataRef.current em vez de configData no closure
  // → dep array fica vazio → useCallback é estável → sem loop
  const carregarProdutos = useCallback(async (cfgOverride) => {
    const { data, error } = await sb.from('produtos').select('*').order('nome')
    if (error) { console.error('produtos:', error); return }

    const prods = data || []
    setProdutosDB(prods)

    // Mapa de estoque por nome+sabor
    const mapa = {}
    prods.forEach(p => {
      const k = eKey(p.nome, p.sabor || '')
      mapa[k] = (mapa[k] || 0) + (p.quantidade || 0)
    })
    setEstoqueMap(mapa)

    // Usa cfgOverride (passado na init) ou a ref atual (chamadas do realtime)
    const cfg = cfgOverride ?? configDataRef.current

    setCatalogo(prev => {
      const nomesVistos = new Set(prev.map(c => c.nome))
      const extras = []

      ;[...new Set(prods.map(p => p.nome))].forEach(nome => {
        if (!nomesVistos.has(nome)) {
          const linha = nome.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')
          extras.push({
            linha, nome, emoji: '💨',
            preco: cfg[`preco:${linha}`] != null ? parseFloat(cfg[`preco:${linha}`]) : 90.00,
            desc:  cfg[`desc:${linha}`] || '',
          })
          nomesVistos.add(nome)
        }
      })

      // Atualiza preços/descs dos modelos já existentes + adiciona novos
      return [
        ...prev.map(cat => ({
          ...cat,
          preco: cfg[cat.linha] != null ? parseFloat(cfg[cat.linha]) : cat.preco,
          desc:  cfg[`desc:${cat.linha}`] || cat.desc,
        })),
        ...extras,
      ]
    })
  }, []) // ← sem dependências → função nunca recriada → sem loop

  // ── Inicialização (roda uma única vez) ────────────────────────────────────
  useEffect(() => {
    let cancelled = false
    const init = async () => {
      const cfg = await carregarPrecosSalvos(CATALOGO_BASE)
      if (!cancelled) {
        await carregarProdutos(cfg)
        setLoading(false)
      }
    }
    init()
    return () => { cancelled = true }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Realtime ──────────────────────────────────────────────────────────────
  const iniciarRealtime = useCallback(() => {
    // Evita inscrições duplicadas
    if (rtRef.current.length > 0) return

    const chProd = sb.channel('rt-produtos')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'produtos' }, () => {
        carregarProdutos() // usa configDataRef internamente → sempre atual
      })
      .subscribe()

    const chPed = sb.channel('rt-pedidos')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'pedidos' }, (ev) => {
        window.dispatchEvent(new CustomEvent('wvpod:novopedido', { detail: ev.new }))
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'pedidos' }, () => {
        window.dispatchEvent(new CustomEvent('wvpod:pedidoatualizado'))
      })
      .subscribe()

    rtRef.current = [chProd, chPed]
  }, [carregarProdutos]) // carregarProdutos é estável → iniciarRealtime também é

  const pararRealtime = useCallback(() => {
    rtRef.current.forEach(ch => sb.removeChannel(ch))
    rtRef.current = []
  }, [])

  // ── Auth ──────────────────────────────────────────────────────────────────
  const login = useCallback((username, senha) => {
    const user = USERS[username]
    if (user && user.senha === senha) {
      const u = { login: username, ...user }
      localStorage.setItem('wvpod_user', JSON.stringify(u))
      setCurrentUser(u)
      iniciarRealtime()
      return true
    }
    return false
  }, [iniciarRealtime])

  const logout = useCallback(() => {
    localStorage.removeItem('wvpod_user')
    setCurrentUser(null)
    pararRealtime()
  }, [pararRealtime])

  // Liga realtime se já estava logado ao recarregar a página
  useEffect(() => {
    if (currentUser) iniciarRealtime()
    return pararRealtime
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Carrinho helpers ──────────────────────────────────────────────────────
  const addToCart = useCallback((linha, sabor, qty, nome, preco) => {
    setCart(prev => {
      const idx = prev.findIndex(i => i.linha === linha && i.sabor === sabor)
      if (idx >= 0) {
        const next = [...prev]
        next[idx] = { ...next[idx], qty: next[idx].qty + qty }
        return next
      }
      return [...prev, { linha, nome, sabor, preco, qty }]
    })
  }, [])

  const removeFromCart = useCallback((idx) => {
    setCart(prev => prev.filter((_, i) => i !== idx))
  }, [])

  const clearCart = useCallback(() => setCart([]), [])

  return (
    <AppContext.Provider value={{
      produtosDB, estoqueMap, catalogo, configData, loading,
      carregarProdutos, carregarPrecosSalvos,
      setCatalogo, setConfigData,
      cart, addToCart, removeFromCart, clearCart,
      currentUser, login, logout,
      toast, toasts,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)
