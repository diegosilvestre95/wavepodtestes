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
  { id: 'dashboard', label: 'Painel Geral', icon: '📊' },
  { id: 'pedidos',   label: 'Pedidos Online', icon: '🛒' },
  { id: 'vendas',    label: 'Vendas Manuais', icon: '💰' },
  { id: 'compras',   label: 'Registrar Compras', icon: '📥' },
  { id: 'estoque',   label: 'Estoque Real', icon: '📦' },
  { id: 'precos',    label: 'Tabela de Preços', icon: '🏷️' },
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
    <div className="app-container">
      {/* 🖥️ SIDEBAR ESTRUTURAL */}
      <aside className="sidebar">
        <div style={{ padding: '0 16px', marginBottom: 40 }}>
           <Logo size={40} light />
        </div>

        <nav style={{ flex: 1 }}>
          {MENU.map(item => (
            <div 
              key={item.id} 
              className={`nav-item ${active === item.id ? 'active' : ''}`}
              onClick={() => setActive(item.id)}
            >
              <span style={{ fontSize: 18 }}>{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}
        </nav>

        <div className="nav-item" onClick={logout} style={{ marginTop: 'auto', borderTop: '1px solid var(--border)', paddingTop: 24, borderRadius: 0 }}>
           <span>🚪</span>
           <span>Sair do Sistema</span>
        </div>
      </aside>

      {/* 🚀 PALCO PRINCIPAL */}
      <main className="main-stage">
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 48 }}>
           <div>
              <h2 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                WavePod ERP / {MENU.find(m => m.id === active)?.label}
              </h2>
           </div>

           <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ textAlign: 'right' }} className="mobile-hidden">
                 <div style={{ fontSize: 14, fontWeight: 700 }}>{currentUser?.nome}</div>
                 <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{currentUser?.role?.toUpperCase()}</div>
              </div>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--wp-yellow)', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900 }}>
                 {currentUser?.nome?.[0] || 'A'}
              </div>
           </div>
        </header>

        <section style={{ animation: 'fadeIn 0.4s ease-out' }}>
           <RenderPage />
        </section>
      </main>

      {/* 📱 MOBILE NAVIGATION */}
      <nav className="bottom-nav mobile-only">
        {MENU.slice(0, 5).map(item => (
          <div 
            key={item.id} 
            className={`bottom-item ${active === item.id ? 'active' : ''}`}
            onClick={() => setActive(item.id)}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: active === item.id ? 'var(--wp-yellow)' : 'var(--text-muted)' }}
          >
            <span style={{ fontSize: 20 }}>{item.icon}</span>
            <span style={{ fontSize: 9, fontWeight: 800, textTransform: 'uppercase', marginTop: 4 }}>{item.id}</span>
          </div>
        ))}
      </nav>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @media (max-width: 768px) { .mobile-hidden { display: none; } }
      `}</style>
    </div>
  )
}
