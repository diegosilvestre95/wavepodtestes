import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { eKey } from '../lib/utils'
import { WA_DIEGO, WA_LUCAS } from '../lib/config'
import Header from '../components/Header'

// ─── PodCard ─────────────────────────────────────────────────────────────────
function PodCard({ cat, produtosDB, estoqueMap, cart, onAddToCart }) {
  const [selecionados, setSelecionados] = useState({}) // { sabor: { id, qty, max } }

  const itens     = produtosDB.filter(p => p.nome === cat.nome && (p.quantidade || 0) > 0)
  const esgotados = produtosDB.filter(p => p.nome === cat.nome && (p.quantidade || 0) === 0)
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

  const changeQty = (delta) => {
    const keys = Object.keys(selecionados)
    if (keys.length !== 1) return
    const sabor = keys[0]
    setSelecionados(prev => {
      const cur = prev[sabor].qty
      const max = prev[sabor].max
      const nv = Math.min(max, Math.max(1, cur + delta))
      return { ...prev, [sabor]: { ...prev[sabor], qty: nv } }
    })
  }

  const handleAddToCart = () => {
    Object.entries(selecionados).forEach(([sabor, info]) => {
      onAddToCart(cat.linha, sabor, info.qty, cat.nome, cat.preco)
    })
    setSelecionados({})
  }

  const countSel = Object.keys(selecionados).length
  const qtySel   = countSel === 1 ? Object.values(selecionados)[0].qty : 0

  return (
    <div className="pod-card">
      {/* Visual hero */}
      <div className="pod-visual">
        <div className="pod-emoji-big">{cat.emoji}</div>
        <div className={`pod-tag${!temEstoque ? ' esgotado-tag' : ''}`}>
          {temEstoque ? 'Disponível' : 'Esgotado'}
        </div>
        <div className="pod-puffs-badge">{cat.desc}</div>
      </div>

      {/* Corpo */}
      <div className="pod-card-body">
        <div className="pod-header-row">
          <div>
            <div className="pod-name">{cat.nome}</div>
            <div className="pod-desc">
              {itens.length} sabor{itens.length !== 1 ? 'es' : ''} disponíve{itens.length !== 1 ? 'is' : 'l'}
            </div>
          </div>
          <div className="pod-price" id={`pprice-${cat.linha}`}>
            R$ {cat.preco.toFixed(2).replace('.', ',')}
          </div>
        </div>

        {/* Chips de sabor */}
        <div>
          <span className="flavor-label">🍃 Escolha o sabor</span>
          <div className="flavor-chips">
            {itens.map(p => (
              <div
                key={p.id}
                className={`fchip${selecionados[p.sabor] ? ' sel' : ''}`}
                onClick={() => toggleSabor(p.sabor, p.id)}
                title={p.sabor}
              >
                {p.sabor || 'Padrão'}
                {p.quantidade <= 3 && p.quantidade > 0 && (
                  <small style={{ opacity: 0.6, fontSize: 10 }}> ({p.quantidade})</small>
                )}
              </div>
            ))}
            {esgotados.map(p => (
              <div key={p.id} className="fchip esgotado" title="Esgotado">
                {p.sabor || 'Padrão'} 🚫
              </div>
            ))}
          </div>
        </div>

        {/* Label de seleção */}
        <div className="sabor-sel-label" style={{ color: countSel > 0 ? 'var(--text)' : 'var(--muted)' }}>
          {countSel === 0 && '← Toque em um sabor para selecionar'}
          {countSel === 1 && (
            <>✅ {Object.keys(selecionados)[0]} selecionado
              {Object.values(selecionados)[0].max <= 5
                ? ` — Últimas ${Object.values(selecionados)[0].max} un!`
                : ''}
            </>
          )}
          {countSel > 1 && <span style={{ color: 'var(--accent3)' }}>✅ {countSel} sabores selecionados</span>}
        </div>

        {/* Ações */}
        <div className="pod-action">
          {/* Qty só aparece com 1 sabor selecionado */}
          <div
            className="qty-wrap"
            id={`qwrap-${cat.linha}`}
            style={{ display: countSel === 1 ? 'flex' : 'none' }}
          >
            <button className="qty-btn" disabled={countSel !== 1} onClick={() => changeQty(-1)}>−</button>
            <div className="qty-num">{qtySel}</div>
            <button className="qty-btn" disabled={countSel !== 1} onClick={() => changeQty(1)}>+</button>
          </div>

          <button
            className="add-btn"
            disabled={countSel === 0}
            onClick={handleAddToCart}
          >
            {countSel === 0
              ? 'Selecione um sabor'
              : countSel === 1
                ? `+ Adicionar`
                : `+ Adicionar ${countSel} sabores`}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── CartBar ─────────────────────────────────────────────────────────────────
function CartBar({ cart, onCheckout }) {
  const total = cart.reduce((a, i) => a + i.preco * i.qty, 0)
  const count = cart.reduce((a, i) => a + i.qty, 0)
  if (count === 0) return null
  return (
    <div className="cart-section">
      <div className="cart-bar vis">
        <div>
          <div className="cart-count">{count} item{count !== 1 ? 's' : ''}</div>
          <div className="cart-sub">Toque para revisar</div>
        </div>
        <div className="cart-total-v">R$ {total.toFixed(2).replace('.', ',')}</div>
        <button className="btn-primary" style={{ padding: '10px 20px', fontSize: 13 }} onClick={onCheckout}>
          Finalizar →
        </button>
      </div>
    </div>
  )
}

// ─── WaFloat ─────────────────────────────────────────────────────────────────
function WaFloat() {
  const [open, setOpen] = useState(false)
  return (
    <div className="wa-float">
      {open && (
        <div className="wa-links">
          <a href={`https://wa.me/${WA_DIEGO}`} target="_blank" rel="noreferrer" className="wa-link">
            <div className="wa-av">D</div>Diego
          </a>
          <a href={`https://wa.me/${WA_LUCAS}`} target="_blank" rel="noreferrer" className="wa-link">
            <div className="wa-av">L</div>Lucas
          </a>
        </div>
      )}
      <button className="wa-main-btn" onClick={() => setOpen(o => !o)} title="Falar com a loja">💬</button>
    </div>
  )
}

// ─── Vitrine (página principal) ───────────────────────────────────────────────
export default function Vitrine() {
  const { catalogo, produtosDB, estoqueMap, cart, addToCart, loading } = useApp()
  const navigate = useNavigate()

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
        {/* Sidebar desktop */}
        <aside className="vitrine-sidebar">
          <div className="vsidebar-logo">
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.1em' }}>
              Categorias
            </div>
          </div>
          <div className="vsidebar-cat-title">Pods Descartáveis</div>
          {sidebarCats.map((cat, i) => (
            <div key={cat.linha} className={`vsidebar-item${i === 0 ? ' active-cat' : ''}`}
              onClick={() => scrollTo(cat.linha)}>
              <span>{cat.emoji}</span> {cat.nome}
              {cat.disponiveis > 0 && <span className="vsidebar-badge">{cat.disponiveis}</span>}
            </div>
          ))}
          <div style={{ marginTop: 'auto', padding: '16px 16px 0', borderTop: '1px solid var(--border)', marginTop: 20 }}>
            <a href={`https://wa.me/${WA_DIEGO}`} target="_blank" rel="noreferrer"
              style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--muted)', fontSize: 12, textDecoration: 'none', padding: '8px 0' }}>
              💬 Falar com Diego
            </a>
            <a href={`https://wa.me/${WA_LUCAS}`} target="_blank" rel="noreferrer"
              style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--muted)', fontSize: 12, textDecoration: 'none', padding: '8px 0' }}>
              💬 Falar com Lucas
            </a>
          </div>
        </aside>

        {/* Conteúdo principal */}
        <main className="vitrine-main">
          {/* Pills mobile */}
          <div className="vitrine-mobile-cats">
            {sidebarCats.map(cat => (
              <div key={cat.linha} className="vcat-pill" onClick={() => scrollTo(cat.linha)}>
                {cat.emoji} {cat.nome}
              </div>
            ))}
          </div>

          <div className="vitrine-hero">
            <h1>Nossos <span>Produtos</span> 🌊</h1>
            <p>Escolha seu pod favorito · Entrega rápida · Pix, débito ou crédito</p>
          </div>

          <div className="catalog-wrap">
            {loading ? (
              <div className="empty"><span>⏳</span>Carregando produtos...</div>
            ) : produtosDB.length === 0 ? (
              <div className="empty"><span>⚠️</span>Nenhum produto encontrado. Verifique a conexão com o banco de dados.</div>
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
