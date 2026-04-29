import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import Dashboard from './admin/Dashboard'
import Vendas    from './admin/Vendas'
import Compras   from './admin/Compras'
import Estoque   from './admin/Estoque'
import Precos    from './admin/Precos'
import Pedidos   from './admin/Pedidos'
import Logo      from '../components/Logo'

const MENU = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'pedidos',   label: 'Pedidos', icon: '🛒' },
  { id: 'vendas',    label: 'Terminal Vendas', icon: '💰' },
  { id: 'compras',   label: 'Entrada Estoque', icon: '📥' },
  { id: 'estoque',   label: 'Estoque Real', icon: '📦' },
  { id: 'precos',    label: 'Configurações', icon: '⚙️' },
]

export default function Admin() {
  const { currentUser, logout } = useApp()
  const navigate = useNavigate()
  const [active, setActive] = useState('dashboard')

  useEffect(() => {
    if (!currentUser) navigate('/login')
  }, [currentUser, navigate])

  const RenderPage = { 
    dashboard: Dashboard, vendas: Vendas, compras: Compras, 
    estoque: Estoque, precos: Precos, pedidos: Pedidos 
  }[active] || Dashboard

  return (
    <div className="app-shell">
      {/* 🏢 ENTERPRISE SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-header">
           <Logo size={32} showText={true} />
        </div>

        <nav style={{ flex: 1 }}>
          {MENU.map(item => (
            <div 
              key={item.id} 
              className={`nav-link ${active === item.id ? 'active' : ''}`}
              onClick={() => setActive(item.id)}
            >
              <span style={{ fontSize: 16 }}>{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}
        </nav>

        {/* COMPACT PROFILE */}
        <div style={{ 
          padding: '16px 24px', 
          borderTop: '1px solid var(--border)', 
          display: 'flex', 
          alignItems: 'center', 
          gap: 12,
          background: '#F9FAFB'
        }}>
           <div style={{ 
             width: 32, height: 32, borderRadius: 4, 
             background: 'var(--wp-yellow)', color: '#000', 
             display: 'flex', alignItems: 'center', justifyContent: 'center', 
             fontWeight: 800, fontSize: 12
           }}>
              {currentUser?.nome?.[0] || 'A'}
           </div>
           <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 700 }}>{currentUser?.nome}</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Admin Master</div>
           </div>
           <button onClick={logout} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 14, color: 'var(--text-muted)' }}>
              🚪
           </button>
        </div>
      </aside>

      {/* 🚀 THE WORKSPACE */}
      <main className="stage">
        <header className="stage-header">
           <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                WavePod ERP / {MENU.find(m => m.id === active)?.label}
              </span>
           </div>

           <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
              <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                 <span style={{ cursor: 'pointer', fontSize: 14 }}>🔔</span>
                 <div style={{ width: 1, height: 20, background: 'var(--border)' }}></div>
                 <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)' }}>SESSÃO ATIVA</span>
              </div>
           </div>
        </header>

        <section className="stage-content">
           <RenderPage />
        </section>
      </main>
    </div>
  )
}
