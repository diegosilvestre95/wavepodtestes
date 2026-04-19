import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { sb } from '../lib/supabase'
import { CATALOGO_BASE, USERS } from '../lib/config'
import { eKey } from '../lib/utils'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  // ── Produtos & catálogo ──────────────────────────────────────────────────
  const [produtosDB, setProdutosDB]   = useState([])
  const [estoqueMap, setEstoqueMap]   = useState({})
  const [catalogo, setCatalogo]       = useState(CATALOGO_BASE)
  const [configData, setConfigData]   = useState({})
  const [loading, setLoading]         = useState(true)

  // ── Carrinho ─────────────────────────────────────────────────────────────
  const [cart, setCart] = useState([])

  // ── Auth ─────────────────────────────────────────────────────────────────
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

  // ── Realtime channels ref ─────────────────────────────────────────────────
  const rtRef = useRef([])

  // ── carregarPrecosSalvos ──────────────────────────────────────────────────
  const carregarPrecosSalvos = useCallback(async (catalogoAtual) => {
    try {
      const { data } = await sb.from('config').select('*')
      const cfg = {}
      ;(data || []).forEach(row => { cfg[row.chave] = row.valor })
      setConfigData(cfg)
      // Aplica preços e descs no catálogo
      setCatalogo(prev =>
        (catalogoAtual || prev).map(cat => ({
          ...cat,
          preco: cfg[cat.linha] != null ? parseFloat(cfg[cat.linha]) : cat.preco,
          desc:  cfg[`desc:${cat.linha}`] || cat.desc,
        }))
      )
      return cfg
    } catch { return {} }
  }, [])

  // ── carregarProdutosDB ────────────────────────────────────────────────────
  const carregarProdutos = useCallback(async (cfgOverride) => {
    const { data, error } = await sb.from('produtos').select('*').order('nome')
    if (error) { console.error('produtos:', error); return }

    const prods = data || []
    setProdutosDB(prods)

    // mapa estoque
    const mapa = {}
    prods.forEach(p => {
      const k = eKey(p.nome, p.sabor || '')
      mapa[k] = (mapa[k] || 0) + (p.quantidade || 0)
    })
    setEstoqueMap(mapa)

    // sincroniza catálogo com modelos novos do DB
    const cfg = cfgOverride || configData
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
      // atualiza preços dos existentes
      return [
        ...prev.map(cat => ({
          ...cat,
          preco: cfg[cat.linha] != null ? parseFloat(cfg[cat.linha]) : cat.preco,
          desc:  cfg[`desc:${cat.linha}`] || cat.desc,
        })),
        ...extras,
      ]
    })
  }, [configData])

  // ── inicialização ─────────────────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      const cfg = await carregarPrecosSalvos(CATALOGO_BASE)
      await carregarProdutos(cfg)
      setLoading(false)
    }
    init()
  }, []) // eslint-disable-line

  // ── Realtime (ligado apenas quando admin logado) ───────────────────────────
  const iniciarRealtime = useCallback(() => {
    const chProd = sb.channel('rt-produtos')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'produtos' }, () => {
        carregarProdutos()
      }).subscribe()

    const chPed = sb.channel('rt-pedidos')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'pedidos' }, (ev) => {
        // dispara evento global para o componente de notificação
        window.dispatchEvent(new CustomEvent('wvpod:novopedido', { detail: ev.new }))
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'pedidos' }, () => {
        window.dispatchEvent(new CustomEvent('wvpod:pedidoatualizado'))
      }).subscribe()

    rtRef.current = [chProd, chPed]
  }, [carregarProdutos])

  const pararRealtime = useCallback(() => {
    rtRef.current.forEach(ch => sb.removeChannel(ch))
    rtRef.current = []
  }, [])

  // ── Auth ─────────────────────────────────────────────────────────────────
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

  // liga realtime se já estava logado (reload de página)
  useEffect(() => {
    if (currentUser) iniciarRealtime()
    return pararRealtime
  }, []) // eslint-disable-line

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
      // dados
      produtosDB, estoqueMap, catalogo, configData, loading,
      // funções de dados
      carregarProdutos, carregarPrecosSalvos,
      // catálogo setter (para compras que adicionam novos modelos)
      setCatalogo, setConfigData,
      // carrinho
      cart, addToCart, removeFromCart, clearCart,
      // auth
      currentUser, login, logout,
      // toast
      toast, toasts,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)
