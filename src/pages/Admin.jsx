import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { fmt } from '../lib/utils'
import { WA_DIEGO, WA_LUCAS } from '../lib/config'
import Header from '../components/Header'
import Dashboard from './admin/Dashboard'
import Vendas    from './admin/Vendas'
import Compras   from './admin/Compras'
import Estoque   from './admin/Estoque'
import Precos    from './admin/Precos'
import Pedidos   from './admin/Pedidos'

const TELAS = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊', section: 'Visão geral' },
  { id: 'pedidos',   label: 'Pedidos',   icon: '📋', section: 'Visão geral' },
  { id: 'vendas',    label: 'Vendas',    icon: '💸', section: 'Operações' },
  { id: 'compras',   label: 'Compras',   icon: '📦', section: 'Operações' },
  { id: 'estoque',   label: 'Estoque',   icon: '🗃️', section: 'Gestão' },
  { id: 'precos',    label: 'Preços',    icon: '💰', section: 'Gestão' },
]
const SECTIONS = ['Visão geral', 'Operações', 'Gestão']

// ─── Notificação de novo pedido ────────────────────────────────────────────────
function NotifModal({ pedido, onClose, onVerPedidos }) {
  if (!pedido) return null
  const itens = JSON.parse(pedido.itens || '[]')
  const cliente = `${pedido.cliente_nome || ''} ${pedido.cliente_sobrenome || ''}`.trim()
  const waRaw = (pedido.cliente_whatsapp || '').replace(/\D/g, '')
  const waNum = waRaw.startsWith('55') && waRaw.length >= 12 ? waRaw : '55' + waRaw
  const msgWA = encodeURIComponent(
    `🌊 Novo Pedido WavePod\nPedido: ${pedido.numero_pedido}\nCliente: ${cliente} (${pedido.cliente_whatsapp})\n` +
    itens.map(i => `• ${i.nome}${i.sabor ? ' · ' + i.sabor : ''} x${i.qty}`).join('\n') +
    `\nTotal: R$ ${fmt(pedido.total)} (${pedido.pagamento})`
  )

  return (
    <div className="notif-ov">
      <div className="notif-box">
        <div className="notif-header">
          <span style={{ fontSize: 26 }}>🔔</span>
          <div>
            <div className="notif-title">Novo Pedido!</div>
            <div style={{ fontSize: 11, color: 'var(--muted)' }}>WavePod · agora</div>
          </div>
        </div>
        <div className="notif-body">
          <strong>Pedido {pedido.numero_pedido}</strong><br />
          👤 {cliente}
          {waRaw && (
            <> · <a href={`https://wa.me/${waNum}`} target="_blank" rel="noreferrer" style={{ color: 'var(--green)' }}>{pedido.cliente_whatsapp}</a></>
          )}<br />
          {itens.map((i, idx) => (
            <span key={idx}>• {i.nome}{i.sabor ? ' · ' + i.sabor : ''} ×{i.qty}<br /></span>
          ))}
          💰 <strong>R$ {fmt(pedido.total)}</strong> · {pedido.pagamento}
        </div>
        <div className="notif-actions">
          <button className="btn-primary" onClick={onVerPedidos} style={{ fontSize: 13, padding: '10px 18px' }}>Ver Pedidos</button>
          <a href={`https://wa.me/${WA_DIEGO}?text=${msgWA}`} target="_blank" rel="noreferrer" className="btn-ghost" style={{ fontSize: 13, padding: '10px 18px', textDecoration: 'none' }}>📲 Diego</a>
          <a href={`https://wa.me/${WA_LUCAS}?text=${msgWA}`} target="_blank" rel="noreferrer" className="btn-ghost" style={{ fontSize: 13, padding: '10px 18px', textDecoration: 'none' }}>📲 Lucas</a>
          <button className="btn-ghost" onClick={onClose} style={{ fontSize: 13, padding: '10px 12px' }}>✕</button>
        </div>
      </div>
    </div>
  )
}

// ─── Admin shell ───────────────────────────────────────────────────────────────
export default function Admin() {
  const { currentUser } = useApp()
  const navigate = useNavigate()
  const [tela, setTela]     = useState('dashboard')
  const [notif, setNotif]   = useState(null)

  // Redireciona se não logado
  useEffect(() => {
    if (!currentUser) navigate('/login')
  }, [currentUser]) // eslint-disable-line

  // Escuta notificações de novos pedidos
  useEffect(() => {
    const handler = (ev) => {
      setNotif(ev.detail)
      // Som de notificação
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)()
        ;[880, 1100].forEach((freq, i) => {
          const osc = ctx.createOscillator(), gain = ctx.createGain()
          osc.connect(gain); gain.connect(ctx.destination)
          osc.frequency.value = freq
          gain.gain.setValueAtTime(.25, ctx.currentTime + i * .18)
          gain.gain.exponentialRampToValueAtTime(.001, ctx.currentTime + i * .18 + .3)
          osc.start(ctx.currentTime + i * .18); osc.stop(ctx.currentTime + i * .18 + .3)
        })
      } catch {}
    }
    window.addEventListener('wvpod:novopedido', handler)
    return () => window.removeEventListener('wvpod:novopedido', handler)
  }, [])

  const COMPONENTES = { dashboard: Dashboard, vendas: Vendas, compras: Compras, estoque: Estoque, precos: Precos, pedidos: Pedidos }
  const Componente = COMPONENTES[tela] || Dashboard

  return (
    <>
      <Header showLogout />

      {/* Mobile nav */}
      <div className="admin-mobile-nav">
        {TELAS.map(t => (
          <button key={t.id}
            className={tela === t.id ? 'active' : ''}
            onClick={() => setTela(t.id)}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      <div className="admin-layout">
        {/* Sidebar desktop */}
        <aside className="admin-sidebar">
          {SECTIONS.map(section => (
            <div key={section}>
              <div className="sidebar-section">{section}</div>
              {TELAS.filter(t => t.section === section).map(t => (
                <button key={t.id}
                  className={`sidebar-item${tela === t.id ? ' active' : ''}`}
                  onClick={() => setTela(t.id)}>
                  <span className="sidebar-icon">{t.icon}</span>
                  <span className="sidebar-label">{t.label}</span>
                </button>
              ))}
            </div>
          ))}
        </aside>

        {/* Conteúdo */}
        <div className="admin-content">
          <div className="wrapper">
            <Componente />
          </div>
        </div>
      </div>

      {/* Notificação */}
      <NotifModal
        pedido={notif}
        onClose={() => setNotif(null)}
        onVerPedidos={() => { setNotif(null); setTela('pedidos') }}
      />
    </>
  )
}
