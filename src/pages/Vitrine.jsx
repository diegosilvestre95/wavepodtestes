import { useState, useMemo, memo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { eKey } from '../lib/utils'
import { WA_DIEGO, WA_LUCAS } from '../lib/config'
import Header from '../components/Header'

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
        <div className="pod-tag" style={{ background: temEstoque ? 'var(--wp-yellow)' : '#52525b', color: '#000' }}>
          {temEstoque ? 'ACTIVE_STOCK' : 'DEPLETED'}
        </div>
      </div>

      <div className="pod-card-body">
        <div style={{ fontSize: 11, fontWeight: 900, color: 'var(--text-dark)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 8 }}>{cat.linha} Edition</div>
        <div className="pod-name">{cat.nome}</div>
        <div style={{ color: 'var(--text-dim)', fontSize: 14, marginBottom: 24 }}>{cat.desc}</div>
        
        <div className="pod-price">R$ {cat.preco.toFixed(2).replace('.', ',')}</div>

        <div style={{ marginTop: 32 }}>
          <span className="flavor-label">Select Flavor Node</span>
          <div className="flavor-chips" style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {itens.map(p => (
              <div key={p.id} 
                className={`fchip${selecionados[p.sabor] ? ' sel' : ''}`} 
                onClick={() => toggleSabor(p.sabor, p.id)}
              >
                {p.sabor}
              </div>
            ))}
            {!temEstoque && <div className="fchip" style={{ opacity: 0.3, cursor: 'not-allowed' }}>Unavailabe</div>}
          </div>
        </div>

        <div style={{ marginTop: 40 }}>
          <button className="btn-ultimate" style={{ width: '100%', height: '60px' }} 
            disabled={countSel === 0} 
            onClick={handleAddToCart}
          >
            {countSel === 0 ? 'CONFIGURE FLAVOR' : `ADD ${countSel} TO ORDER`}
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
    <div style={{ position: 'fixed', bottom: 40, left: '50%', transform: 'translateX(-50%)', zIndex: 1100, width: '90%', maxWidth: 600 }}>
      <div style={{ 
        background: 'rgba(9,9,11,0.8)', 
        backdropFilter: 'blur(24px)', 
        border: '1px solid var(--border-gold)', 
        borderRadius: '30px', 
        padding: '20px 40px', 
        boxShadow: '0 30px 60px rgba(0,0,0,0.8)', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center' 
      }}>
        <div style={{ display: 'flex', gap: 32 }}>
           <div>
              <div style={{ fontSize: 10, fontWeight: 900, color: 'var(--text-dark)', textTransform: 'uppercase' }}>Items</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#FFF' }}>{count}</div>
           </div>
           <div>
              <div style={{ fontSize: 10, fontWeight: 900, color: 'var(--text-dark)', textTransform: 'uppercase' }}>Subtotal</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--wp-yellow)' }}>R$ {total.toFixed(2).replace('.', ',')}</div>
           </div>
        </div>
        <button className="btn-ultimate" style={{ padding: '12px 28px', fontSize: 12 }} onClick={onCheckout}>
          INIT_ORDER_FLOW →
        </button>
      </div>
    </div>
  )
}

export default function Vitrine() {
  const { catalogo, produtosDB, estoqueMap, cart, addToCart, loading } = useApp()
  const navigate = useNavigate()

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'dark')
  }, [])

  const scrollTo = (linha) => {
    const el = document.getElementById(`pc-${linha}`)
    if (el) {
      const offset = 120
      const bodyRect = document.body.getBoundingClientRect().top
      const elementRect = el.getBoundingClientRect().top
      const elementPosition = elementRect - bodyRect
      const offsetPosition = elementPosition - offset
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' })
    }
  }

  return (
    <div style={{ background: 'var(--bg-deep)', minHeight: '100vh' }}>
      <Header showAdminBtn />

      <div className="vitrine-shell">
        <aside className="vitrine-sidebar">
          <div style={{ flex: 1 }}>
            <div className="vsidebar-cat-title">Catalogue Nodes</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 24 }}>
              {catalogo.map((cat) => {
                const count = produtosDB.filter(p => p.nome === cat.nome && (p.quantidade || 0) > 0).length
                return (
                  <div key={cat.linha} className="vsidebar-item" onClick={() => scrollTo(cat.linha)}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <span style={{ fontSize: 20 }}>{cat.emoji}</span> {cat.nome}
                    </div>
                    {count > 0 && <span className="vsidebar-badge">{count}</span>}
                  </div>
                )
              })}
            </div>
          </div>
          
          <div style={{ marginTop: 40, padding: 24, background: 'rgba(255,255,255,0.02)', borderRadius: 20, border: '1px solid var(--border)' }}>
            <div className="vsidebar-cat-title" style={{ marginBottom: 16 }}>Direct Access</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <a href={`https://wa.me/${WA_DIEGO}`} target="_blank" rel="noreferrer" style={{ color: 'var(--text-dim)', fontSize: 13, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 12 }}>
                 <div style={{ width: 8, height: 8, background: '#22c55e', borderRadius: '50%', boxShadow: '0 0 10px #22c55e' }}></div> Diego_Ops
              </a>
              <a href={`https://wa.me/${WA_LUCAS}`} target="_blank" rel="noreferrer" style={{ color: 'var(--text-dim)', fontSize: 13, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 12 }}>
                 <div style={{ width: 8, height: 8, background: '#22c55e', borderRadius: '50%', boxShadow: '0 0 10px #22c55e' }}></div> Lucas_Log
              </a>
            </div>
          </div>
        </aside>

        <main className="vitrine-main">
          <div className="vitrine-hero">
            <div style={{ fontSize: 12, fontWeight: 900, color: 'var(--wp-yellow)', letterSpacing: '0.4em', marginBottom: 24, textTransform: 'uppercase' }}>Authentic_Vaporizers_Node</div>
            <h1>Premium <span style={{ color: 'var(--wp-yellow)' }}>Disposable</span><br/>Pods Catalog</h1>
            <p style={{ maxWidth: 600, marginTop: 24, color: 'var(--text-dim)', fontSize: 18, lineHeight: 1.6 }}>The definitive collection of elite vaporizers. Engineering quality, express logistics, and the most exclusive flavors in the territory.</p>
          </div>

          <div className="catalog-wrap">
            {loading ? (
              <div style={{ padding: 100, textAlign: 'center' }}>
                <div className="loader" style={{ margin: '0 auto' }}></div>
                <div style={{ marginTop: 20, fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-dark)', letterSpacing: '0.2em' }}>SYNCING_INVENTORY...</div>
              </div>
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
    </div>
  )
}
