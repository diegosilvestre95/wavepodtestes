import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { fmt } from '../lib/utils'
import Dashboard from './admin/Dashboard'
import Vendas    from './admin/Vendas'
import Compras   from './admin/Compras'
import Estoque   from './admin/Estoque'
import Precos    from './admin/Precos'
import Pedidos   from './admin/Pedidos'

const NAV_ITEMS = [
  { id: 'pedidos',   label: 'Pedidos',   icon: '📋' },
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'vendas',    label: 'Nova Venda', icon: '💸' },
  { id: 'compras',   label: 'Estoque',    icon: '📦' },
  { id: 'estoque',   label: 'Inventário', icon: '🗃️' },
  { id: 'precos',    label: 'Tabela',     icon: '💰' },
]

export default function Admin() {
  const { currentUser, logout } = useApp()
  const navigate = useNavigate()
  const [tela, setTela] = useState('dashboard')

  useEffect(() => {
    if (!currentUser) navigate('/login')
  }, [currentUser, navigate])

  const COMPONENTES = { dashboard: Dashboard, vendas: Vendas, compras: Compras, estoque: Estoque, precos: Precos, pedidos: Pedidos }
  const Componente = COMPONENTES[tela] || Dashboard

  return (
    <div className="admin-layout">
      {/* SIDEBAR REPLICADA (iMAC MOCKUP) */}
      <aside className="admin-sidebar">
        <div className="sidebar-logo-area">
          <Link to="/" className="logo" style={{ marginBottom: 0 }}>
             <div className="logo-mark" style={{ width: 36, height: 36 }} />
             <div>
                <div className="logo-text" style={{ fontSize: 18, color: '#000' }}>WAVEPOD</div>
                <div className="logo-subtext">Pods Descartáveis</div>
             </div>
          </Link>
        </div>

        <nav className="sidebar-nav">
          {NAV_ITEMS.map(item => (
            <div key={item.id} 
                 className={`nav-item ${tela === item.id ? 'active' : ''}`}
                 onClick={() => setTela(item.id)}>
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}
          
          <div style={{ padding: '20px 16px', color: '#888', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', marginTop: 20 }}>
            Configurações
          </div>
          <div className="nav-item"><span>⚙️</span><span>Preferências</span></div>
        </nav>

        <div className="sidebar-footer">
           <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--wp-yellow)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontWeight: 800, fontSize: 12 }}>
             {currentUser?.nome?.[0] || 'A'}
           </div>
           <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 700 }}>{currentUser?.nome || 'Admin'}</div>
              <div style={{ fontSize: 10, opacity: 0.6 }}>Sessão Ativa</div>
           </div>
           <span style={{ cursor: 'pointer', fontSize: 12 }} onClick={() => logout()}>🚪</span>
        </div>
      </aside>

      {/* PALCO PRINCIPAL */}
      <main className="main-stage">
        <header className="top-header">
           <div className="search-box">
              <span style={{ opacity: 0.4 }}>🔍</span>
              <input type="text" placeholder="Buscar pedidos, produtos ou clientes..." />
           </div>

           <div className="header-tools">
              <span className="tool-icon">❓</span>
              <span className="tool-icon active">🔔</span>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#000', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800 }}>WP</div>
           </div>
        </header>

        <div className="dash-content">
           <Componente />
        </div>
      </main>
    </div>
  )
}
