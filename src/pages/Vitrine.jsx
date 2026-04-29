import { useState, useMemo, memo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { eKey } from '../lib/utils'
import { WA_DIEGO, WA_LUCAS } from '../lib/config'
import Header from '../components/Header'

// memo: evita re-render do card quando outros cards ou o carrinho mudam
const PodCard = memo(function PodCard({ cat, produtosDB, estoqueMap, cart, onAddToCart }) {
  const [selecionados, setSelecionados] = useState({})

  const itens     = produtosDB.filter(p => p.nome === cat.nome && (p.quantidade || 0) > 0)
  const temEstoque = itens.length > 0

  const toggleSabor = (sabor, prodId) => {
    const k = eKey(cat.nome, sabor)
    if ((estoqueMap[k] || 0) === 0) return
    setSelecionados(prev => {
      if (prev[sabor]) {
        const next = { ...prev }
        delete next[sabor]
        return next
      }
      const noCart = cart
        .filter(i => i.linha === cat.linha && i.sabor === sabor)
        .reduce((a, i) => a + i.qty, 0)
      const maxDisp = Math.max(0, (estoqueMap[k] || 0) - noCart)
      if (maxDisp === 0) return prev
      return { ...prev, [sabor]: { id: prodId, qty: 1, max: maxDisp } }
    })
  }

  const handleAddToCart = () => {
    Object.entries(selecionados).forEach(([sabor, info]) => {
      onAddToCart(cat.linha, sabor, info.qty, cat.nome, cat.preco)
    })
    setSelecionados({})
  }

  const countSel = Object.keys(selecionados).length

  return (
    <div className="pod-card">
      <div className="pod-visual">
        <div className="pod-emoji-big">{cat.emoji}</div>
        <div className={`pod-tag${!temEstoque ? ' esgotado-tag' : ''}`}>
          {temEstoque ? 'LIVE STOCK' : 'OUT OF STOCK'}
        </div>
        <div className="pod-puffs-badge">{cat.desc}</div>
      </div>

      <div className="pod-card-body">
        <div className="pod-name">{cat.nome}</div>
        <div style={{ color: 'var(--wp-silver)', fontSize: 13, marginBottom: 20, opacity: 0.7 }}>
          Edition 2026 · Premium Quality · {itens.length} flavors
        </div>
        
        <div className="pod-price">R$ {cat.preco.toFixed(2).replace('.', ',')}</div>

        <div style={{ marginTop: 32 }}>
          <span className="flavor-label">Select Essence</span>
          <div className="flavor-chips">
            {itens.map(p => (
              <div key={p.id} 
                className={`fchip${selecionados[p.sabor] ? ' sel' : ''}`} 
                onClick={() => toggleSabor(p.sabor, p.id)}
              >
                {p.sabor}
              </div>
            ))}
            {itens.length === 0 && <div className="fchip esgotado">No flavors available</div>}
          </div>
        </div>

        <div className="pod-action" style={{ marginTop: 40 }}>
          <button className="btn-primary" style={{ width: '100%', height: '56px', fontSize: '15px', letterSpacing: '0.05em' }} 
            disabled={countSel === 0} 
            onClick={handleAddToCart}
          >
            {countSel === 0 ? 'SELECT FLAVOR' : 'ADD TO CART'}
          </button>
        </div>
      </div>
    </div>
  )
})

function CartBar({ cart, onCheckout }) {
  const total = cart.reduce((a, i) => a + i.preco * i.qty, 0)
  const count = cart.reduce((a, i) => a + i.qty, 0)
  if (count === 0) return null
  return (
    <div className="cart-section" style={{ position: 'fixed', bottom: 30, left: '50%', transform: 'translateX(-50%)', zIndex: 1100, width: 'auto' }}>
      <div className="cart-bar vis" style={{ background: 'var(--grad-metallic)', border: '1px solid var(--wp-yellow)', borderRadius: '20px', padding: '15px 30px', boxShadow: '0 20px 50px rgba(0,0,0,0.5)', display: 'flex', gap: 40, alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--wp-yellow)', textTransform: 'uppercase' }}>Seu Carrinho</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>{count} item{count !== 1 ? 's' : ''}</div>
        </div>
        <div style={{ fontSize: 24, fontWeight: 900, color: '#fff', fontFamily: 'var(--font-display)' }}>R$ {total.toFixed(2).replace('.', ',')}</div>
        <button className="btn-primary" style={{ padding: '12px 24px', borderRadius: '12px' }} onClick={onCheckout}>
          FINALIZAR →
        </button>
      </div>
    </div>
  )
}

function WaFloat() {
  const [open, setOpen] = useState(false)
  return (
    <div className="wa-float" style={{ position: 'fixed', bottom: 30, right: 30, zIndex: 1100 }}>
      {open && (
        <div className="wa-links" style={{ marginBottom: 15, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <a href={`https://wa.me/${WA_DIEGO}`} target="_blank" rel="noreferrer" className="btn-ghost" style={{ background: '#fff', color: '#000', border: 'none', display: 'flex', alignItems: 'center', gap: 10, padding: '12px 20px', borderRadius: '12px' }}>
            💬 Diego
          </a>
          <a href={`https://wa.me/${WA_LUCAS}`} target="_blank" rel="noreferrer" className="btn-ghost" style={{ background: '#fff', color: '#000', border: 'none', display: 'flex', alignItems: 'center', gap: 10, padding: '12px 20px', borderRadius: '12px' }}>
            💬 Lucas
          </a>
        </div>
      )}
      <button className="logo-mark" style={{ width: 60, height: 60, fontSize: 24, cursor: 'pointer' }} onClick={() => setOpen(o => !o)}>💬</button>
    </div>
  )
}

export default function Vitrine() {
  const { catalogo, produtosDB, estoqueMap, cart, addToCart, loading } = useApp()
  const navigate = useNavigate()

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'dark')
  }, [])

  const sidebarCats = useMemo(() =>
    catalogo.map(cat => ({
      ...cat,
      disponiveis: produtosDB.filter(p => p.nome === cat.nome && (p.quantidade || 0) > 0).length,
    })),
    [catalogo, produtosDB]
  )

  const scrollTo = (linha) => {
    document.getElementById(`pc-${linha}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <>
      <Header showAdminBtn />

      <div className="vitrine-shell">
        <aside className="vitrine-sidebar">
          <div className="vsidebar-cat-title">Categorias Premium</div>
          {sidebarCats.map((cat) => (
            <div key={cat.linha} className="vsidebar-item" onClick={() => scrollTo(cat.linha)}>
              <span style={{ fontSize: 18 }}>{cat.emoji}</span> {cat.nome}
              {cat.disponiveis > 0 && <span className="vsidebar-badge" style={{ background: 'var(--wp-yellow)', color: '#000' }}>{cat.disponiveis}</span>}
            </div>
          ))}
          
          <div style={{ marginTop: 'auto', padding: '20px 0', borderTop: 'var(--border-glass)' }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--wp-silver)', opacity: 0.5, marginBottom: 15, textTransform: 'uppercase' }}>Suporte ao Cliente</div>
            <a href={`https://wa.me/${WA_DIEGO}`} target="_blank" rel="noreferrer" style={{ color: '#fff', fontSize: 13, textDecoration: 'none', display: 'block', marginBottom: 8 }}>• Falar com Diego</a>
            <a href={`https://wa.me/${WA_LUCAS}`} target="_blank" rel="noreferrer" style={{ color: '#fff', fontSize: 13, textDecoration: 'none', display: 'block' }}>• Falar com Lucas</a>
          </div>
        </aside>

        <main className="vitrine-main">
          <div className="vitrine-hero">
            <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--wp-yellow)', letterSpacing: '0.3em', marginBottom: 20, textTransform: 'uppercase' }}>WavePod Experience</div>
            <h1>Sua Experiência <span>Premium</span><br/>em Vapes 🌊</h1>
            <p>O melhor catálogo de pods descartáveis do Brasil. Qualidade garantida, entrega expressa e os sabores mais procurados do mercado.</p>
            <button className="btn-primary" style={{ marginTop: 40, padding: '18px 40px' }} onClick={() => scrollTo(catalogo[0]?.linha)}>EXPLORAR CATÁLOGO</button>
          </div>

          <div className="catalog-wrap">
            {loading ? (
              <div className="empty" style={{ color: '#fff' }}>Carregando inteligência de estoque...</div>
            ) : (
              catalogo.map(cat => (
                <div key={cat.linha} id={`pc-${cat.linha}`}>
                  <PodCard
                    cat={cat}
                    produtosDB={produtosDB}
                    estoqueMap={estoqueMap}
                    cart={cart}
                    onAddToCart={addToCart}
                  />
                </div>
              ))
            )}
          </div>
        </main>
      </div>

      <CartBar cart={cart} onCheckout={() => navigate('/checkout')} />
      <WaFloat />
    </>
  )
}
