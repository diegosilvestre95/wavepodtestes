import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
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
  { id: 'dashboard', label: 'Dashboard', icon: '📊', section: 'MÉTRICAS' },
  { id: 'pedidos',   label: 'Gestão Pedidos', icon: '📋', section: 'MÉTRICAS' },
  { id: 'vendas',    label: 'Nova Venda',    icon: '💸', section: 'OPERAÇÕES' },
  { id: 'compras',   label: 'Entrada Estoque', icon: '📦', section: 'OPERAÇÕES' },
  { id: 'estoque',   label: 'Inventário',    icon: '🗃️', section: 'GESTÃO' },
  { id: 'precos',    label: 'Tabela Preços',    icon: '💰', section: 'GESTÃO' },
]
const SECTIONS = ['MÉTRICAS', 'OPERAÇÕES', 'GESTÃO']

function NotifModal({ pedido, onClose, onVerPedidos }) {
  if (!pedido) return null
  const itens = JSON.parse(pedido.itens || '[]')
  const cliente = `${pedido.cliente_nome || ''} ${pedido.cliente_sobrenome || ''}`.trim()
  const msgWA = encodeURIComponent(`🌊 Novo Pedido WavePod\nPedido: ${pedido.numero_pedido}\nTotal: R$ ${fmt(pedido.total)}`)

  return (
    <div className="notif-ov">
      <div className="notif-box" style={{ background: 'var(--grad-metallic)', border: '1px solid var(--wp-yellow)' }}>
        <div style={{ fontSize: 40, marginBottom: 20 }}>🔔</div>
        <h2 style={{ fontSize: 28, fontWeight: 800, color: '#fff', marginBottom: 10 }}>Novo Pedido Detectado</h2>
        <p style={{ color: 'var(--wp-silver)', marginBottom: 30 }}>Cliente: {cliente} · Total: R$ {fmt(pedido.total)}</p>
        <div style={{ display: 'flex', gap: 15 }}>
          <button className="btn-primary" onClick={onVerPedidos}>VER NO PAINEL</button>
          <button className="btn-ghost" style={{ borderColor: '#fff', color: '#fff' }} onClick={onClose}>FECHAR</button>
        </div>
      </div>
    </div>
  )
}

export default function Admin() {
  const { currentUser } = useApp()
  const navigate = useNavigate()
  const [tela, setTela]     = useState('dashboard')
  const [notif, setNotif]   = useState(null)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'light')
  }, [])

  useEffect(() => {
    if (!currentUser) navigate('/login')
  }, [currentUser, navigate])

  useEffect(() => {
    const handler = (ev) => {
      setNotif(ev.detail)
    }
    window.addEventListener('wvpod:novopedido', handler)
    return () => window.removeEventListener('wvpod:novopedido', handler)
  }, [])

  const COMPONENTES = { dashboard: Dashboard, vendas: Vendas, compras: Compras, estoque: Estoque, precos: Precos, pedidos: Pedidos }
  const Componente = COMPONENTES[tela] || Dashboard

  return (
    <>
      <div className="admin-layout">
        {/* SIDEBAR REFINADA (CONFORME REFERÊNCIA) */}
        <aside className="admin-sidebar">
          <div style={{ padding: '0 28px 40px' }}>
             <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 12, padding: '16px', background: '#f8f9fa', borderRadius: '12px', border: '1px solid #eee' }}>
                <div className="logo-mark" style={{ width: 36, height: 36 }} />
                <div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: '#000' }}>WAVEPOD</div>
                    <div style={{ fontSize: 10, color: '#999', fontWeight: 600 }}>PAINEL ESTRATÉGICO</div>
                </div>
             </Link>
          </div>

          {SECTIONS.map(section => (
            <div key={section} style={{ marginBottom: 32 }}>
              <div className="sidebar-label-small" style={{ padding: '0 28px' }}>{section}</div>
              {TELAS.filter(t => t.section === section).map(t => (
                <div key={t.id}
                  className={`admin-sidebar-item${tela === t.id ? ' active' : ''}`}
                  onClick={() => setTela(t.id)}>
                  <span style={{ fontSize: 18 }}>{t.icon}</span>
                  <span>{t.label}</span>
                </div>
              ))}
            </div>
          ))}

          <div style={{ marginTop: 'auto', padding: '32px 28px', borderTop: '1px solid #f1f3f5' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--wp-yellow)', fontWeight: 800, fontSize: 16 }}>
                  {currentUser?.nome?.[0] || 'A'}
                </div>
                <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#000' }}>{currentUser?.nome || 'Administrador'}</div>
                    <div style={{ fontSize: 11, color: '#999', fontWeight: 600 }}>Acesso Vitalício</div>
                </div>
             </div>
          </div>
        </aside>

        {/* CONTEÚDO COM HEADER DE BUSCA (ESTILO REF) */}
        <main className="admin-content" style={{ display: 'flex', flexDirection: 'column', gap: 0, padding: 0 }}>
          <div style={{ height: 70, background: '#fff', borderBottom: '1px solid #ddd', display: 'flex', alignItems: 'center', padding: '0 40px', justifyContent: 'space-between' }}>
             <div style={{ background: '#f0f0f0', padding: '10px 20px', borderRadius: '10px', width: 400, display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ opacity: 0.4 }}>🔍</span>
                <input type="text" placeholder="Buscar pedidos, clientes ou produtos..." style={{ border: 'none', background: 'transparent', padding: 0, fontSize: 13 }} />
             </div>
             <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
                <span style={{ fontSize: 20, cursor: 'pointer', opacity: 0.6 }}>❓</span>
                <span style={{ fontSize: 20, cursor: 'pointer', opacity: 0.6 }}>🔔</span>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#000', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800 }}>WP</div>
             </div>
          </div>
          
          <div style={{ padding: 40, flex: 1, overflowY: 'auto' }}>
            <Componente />
          </div>
        </main>
      </div>

      <NotifModal
        pedido={notif}
        onClose={() => setNotif(null)}
        onVerPedidos={() => { setNotif(null); setTela('pedidos') }}
      />
    </>
  )
}
