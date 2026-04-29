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
    <div className="product-card">
      <div className="product-image">
        <div style={{ filter: 'drop-shadow(0 0 10px rgba(255,215,0,0.2))' }}>{cat.emoji}</div>
        <div className={`badge ${temEstoque ? 'badge-success' : 'badge-warning'}`} style={{ position: 'absolute', top: 20, right: 20 }}>
          {temEstoque ? 'EM ESTOQUE' : 'ESGOTADO'}
        </div>
      </div>

      <div className="product-info">
        <div style={{ fontSize: 11, fontWeight: 900, color: 'var(--text-dim)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>Linha {cat.linha}</div>
        <h3 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>{cat.nome}</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 20 }}>{cat.desc}</p>
        
        <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-main)' }}>R$ {cat.preco.toFixed(2).replace('.', ',')}</div>

        <div style={{ marginTop: 24 }}>
          <span style={{ display: 'block', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 12 }}>Sabores Disponíveis</span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {itens.map(p => (
              <div key={p.id} 
                className={`fchip${selecionados[p.sabor] ? ' sel' : ''}`} 
                onClick={() => toggleSabor(p.sabor, p.id)}
              >
                {p.sabor}
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 32 }}>
          <button className="btn-primary" style={{ width: '100%', height: '52px', fontSize: '14px' }} 
            disabled={countSel === 0} 
            onClick={handleAddToCart}
          >
            {countSel === 0 ? 'SELECIONE O SABOR' : `ADICIONAR ${countSel} AO CARRINHO`}
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
    <div style={{ position: 'fixed', bottom: 30, left: '50%', transform: 'translateX(-50%)', zIndex: 1100, width: 'auto', minWidth: 400 }}>
      <div style={{ 
        background: '#111827', 
        border: '1px solid var(--wp-yellow)', 
        borderRadius: '16px', 
        padding: '16px 32px', 
        boxShadow: '0 20px 40px rgba(0,0,0,0.2)', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        gap: 40
      }}>
        <div style={{ display: 'flex', gap: 32 }}>
           <div>
              <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase' }}>Itens</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#FFF' }}>{count}</div>
           </div>
           <div>
              <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase' }}>Subtotal</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--wp-yellow)' }}>R$ {total.toFixed(2).replace('.', ',')}</div>
           </div>
        </div>
        <button className="btn-primary" style={{ padding: '10px 20px' }} onClick={onCheckout}>
          FINALIZAR PEDIDO →
        </button>
      </div>
    </div>
  )
}

export default function Vitrine() {
  const { catalogo, produtosDB, estoqueMap, cart, addToCart, loading } = useApp()
  const navigate = useNavigate()

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'light') // Voltando para light como base do design novo
  }, [])

  const scrollTo = (linha) => {
    const el = document.getElementById(`pc-${linha}`)
    if (el) {
      window.scrollTo({ top: el.offsetTop - 100, behavior: 'smooth' })
    }
  }

  return (
    <div style={{ background: 'var(--bg-app)', minHeight: '100vh' }}>
      <Header showAdminBtn />

      <div className="store-container">
        <div style={{ marginBottom: 64, textAlign: 'center' }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--wp-yellow-dark)', letterSpacing: '0.2em', marginBottom: 16, textTransform: 'uppercase' }}>WavePod Official Store</div>
          <h1 style={{ fontSize: 48, fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 16 }}>Catálogo de <span style={{ color: 'var(--wp-yellow-dark)' }}>Pods Premium</span></h1>
          <p style={{ maxWidth: 700, margin: '0 auto', color: 'var(--text-muted)', fontSize: 18 }}>Os melhores descartáveis do mercado com entrega imediata e garantia de autenticidade.</p>
        </div>

        <div className="product-grid">
          {loading ? (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 100 }}>
              <div className="loader" style={{ margin: '0 auto' }}></div>
              <div style={{ marginTop: 20, fontWeight: 700, color: 'var(--text-muted)' }}>SINCRONIZANDO ESTOQUE...</div>
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
      </div>

      <CartBar cart={cart} onCheckout={() => navigate('/checkout')} />
    </div>
  )
}
