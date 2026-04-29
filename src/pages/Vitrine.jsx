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
        <div className={`pod-tag${!temEstoque ? ' esgotado-tag' : ''}`}>
          {temEstoque ? 'LIVE STOCK' : 'OUT OF STOCK'}
        </div>
      </div>

      <div className="pod-card-body">
        <div className="pod-name">{cat.nome}</div>
        <div style={{ color: 'var(--wp-silver)', fontSize: 13, marginBottom: 12, opacity: 0.6 }}>
          Premium Edition · {cat.desc}
        </div>
        
        <div className="pod-price">R$ {cat.preco.toFixed(2).replace('.', ',')}</div>

        <div style={{ marginTop: 24 }}>
          <span className="flavor-label">Disponibilidade de Sabores</span>
          <div className="flavor-chips">
            {itens.map(p => (
              <div key={p.id} 
                className={`fchip${selecionados[p.sabor] ? ' sel' : ''}`} 
                onClick={() => toggleSabor(p.sabor, p.id)}
              >
                {p.sabor}
              </div>
            ))}
            {!temEstoque && <div className="fchip" style={{ opacity: 0.5 }}>Esgotado</div>}
          </div>
        </div>

        <div className="pod-action" style={{ marginTop: 32 }}>
          <button className="btn-primary" style={{ width: '100%', height: '56px', fontSize: '15px' }} 
            disabled={countSel === 0} 
            onClick={handleAddToCart}
          >
            {countSel === 0 ? 'SELECIONE O SABOR' : 'ADICIONAR AO CARRINHO'}
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
      <div style={{ background: 'var(--wp-gray-dark)', border: '1px solid var(--wp-yellow)', borderRadius: '24px', padding: '16px 32px', boxShadow: '0 20px 50px rgba(0,0,0,0.6)', display: 'flex', gap: 40, alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--wp-yellow)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Meu Pedido</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>{count} produto{count !== 1 ? 's' : ''}</div>
        </div>
        <div style={{ fontSize: 24, fontWeight: 900, color: '#fff', fontFamily: 'var(--font-display)' }}>R$ {total.toFixed(2).replace('.', ',')}</div>
        <button className="btn-primary" style={{ padding: '12px 24px', borderRadius: '14px' }} onClick={onCheckout}>
          CHECKOUT →
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
          <div>
            <div className="vsidebar-cat-title">Categorias</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 20 }}>
              {sidebarCats.map((cat) => (
                <div key={cat.linha} className="vsidebar-item" onClick={() => scrollTo(cat.linha)}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span>{cat.emoji}</span> {cat.nome}
                  </div>
                  {cat.disponiveis > 0 && <span className="vsidebar-badge">{cat.disponiveis}</span>}
                </div>
              ))}
            </div>
          </div>
          
          <div style={{ marginTop: 'auto', borderTop: 'var(--border-glass)', paddingTop: 30 }}>
            <div className="vsidebar-cat-title">Suporte</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 20 }}>
              <a href={`https://wa.me/${WA_DIEGO}`} target="_blank" rel="noreferrer" style={{ color: '#fff', fontSize: 13, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
                 <div style={{ width: 8, height: 8, background: '#22c55e', borderRadius: '50%' }}></div> Falar com Diego
              </a>
              <a href={`https://wa.me/${WA_LUCAS}`} target="_blank" rel="noreferrer" style={{ color: '#fff', fontSize: 13, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
                 <div style={{ width: 8, height: 8, background: '#22c55e', borderRadius: '50%' }}></div> Falar com Lucas
              </a>
            </div>
          </div>
        </aside>

        <main className="vitrine-main">
          <div className="vitrine-hero">
            <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--wp-yellow)', letterSpacing: '0.2em', marginBottom: 16, textTransform: 'uppercase' }}>Authentic Vaporizers</div>
            <h1>Sua Experiência <span>Premium</span><br/>em Vapes 🌊</h1>
            <p>O melhor catálogo de pods descartáveis do Brasil. Qualidade garantida, entrega expressa e os sabores mais procurados do mercado.</p>
          </div>

          <div className="catalog-wrap">
            {loading ? (
              <div style={{ padding: 40, textAlign: 'center', color: '#666' }}>Sincronizando estoque...</div>
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
    </>
  )
}
