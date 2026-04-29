import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { sb } from '../lib/supabase'
import { CATALOGO_BASE, USERS } from '../lib/config'
import { eKey } from '../lib/utils'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [produtosDB, setProdutosDB] = useState([])
  const [estoqueMap, setEstoqueMap] = useState({})
  const [catalogo, setCatalogo]     = useState(CATALOGO_BASE)
  const [configData, setConfigData] = useState({})
  const [loading, setLoading]       = useState(true)
  const [cart, setCart]             = useState([])
  const [currentUser, setCurrentUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('wvpod_user')) } catch { return null }
  })
  const [toasts, setToasts] = useState([])

  // Refs estáveis — evitam loops de dependência e dupla inicialização
  const configRef   = useRef({})
  const rtRef       = useRef([])
  const initDoneRef = useRef(false)

  useEffect(() => { configRef.current = configData }, [configData])

  const toast = useCallback((msg, icon = '✓') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, msg, icon }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3200)
  }, [])

  // Dep array vazio em ambas as funções → estáveis → sem loop
  const carregarPrecosSalvos = useCallback(async (catalogoBase) => {
    try {
      const { data } = await sb.from('config').select('*')
      const cfg = {}
      ;(data || []).forEach(row => { cfg[row.chave] = row.valor })
      configRef.current = cfg
      setConfigData(cfg)
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
  }, [])

  const carregarProdutos = useCallback(async (cfgOverride) => {
    const { data, error } = await sb.from('produtos').select('*').order('nome')
    if (error) { console.error('produtos:', error); return }

    const prods = data || []
    setProdutosDB(prods)

    const mapa = {}
    prods.forEach(p => {
      const k = eKey(p.nome, p.sabor || '')
      mapa[k] = (mapa[k] || 0) + (p.quantidade || 0)
    })
    setEstoqueMap(mapa)

    const cfg = cfgOverride ?? configRef.current

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
      return [
        ...prev.map(cat => ({
          ...cat,
          preco: cfg[cat.linha] != null ? parseFloat(cfg[cat.linha]) : cat.preco,
          desc:  cfg[`desc:${cat.linha}`] || cat.desc,
        })),
        ...extras,
      ]
    })
  }, [])

  const pararRealtime = useCallback(() => {
    rtRef.current.forEach(ch => sb.removeChannel(ch))
    rtRef.current = []
  }, [])

  const iniciarRealtime = useCallback(() => {
    if (rtRef.current.length > 0) return  // guard: nunca inscreve duas vezes
    const chProd = sb.channel('rt-produtos')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'produtos' }, () => {
        carregarProdutos()
      }).subscribe()
    const chPed = sb.channel('rt-pedidos')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'pedidos' }, (ev) => {
        window.dispatchEvent(new CustomEvent('wvpod:novopedido', { detail: ev.new }))
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'pedidos' }, () => {
        window.dispatchEvent(new CustomEvent('wvpod:pedidoatualizado'))
      }).subscribe()
    rtRef.current = [chProd, chPed]
  }, [carregarProdutos])

  // Init: initDoneRef garante execução única mesmo no StrictMode
  useEffect(() => {
    if (initDoneRef.current) return
    initDoneRef.current = true
    const run = async () => {
      const cfg = await carregarPrecosSalvos(CATALOGO_BASE)
      await carregarProdutos(cfg)
      setLoading(false)
    }
    run()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Realtime para admin logado
  useEffect(() => {
    if (currentUser) iniciarRealtime()
    return pararRealtime
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const login = useCallback((username, senha) => {
    // Busca a chave original ignorando maiúsculas/minúsculas
    const keyOriginal = Object.keys(USERS).find(k => k.toLowerCase() === username.toLowerCase())
    const user = keyOriginal ? USERS[keyOriginal] : null

    if (user && user.senha === senha) {
      const u = { login: keyOriginal, ...user }
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
