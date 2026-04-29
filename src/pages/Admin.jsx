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
  { id: 'dashboard', label: 'Overview', icon: '📊' },
  { id: 'pedidos',   label: 'Requests', icon: '🛒' },
  { id: 'vendas',    label: 'Terminal', icon: '💰' },
  { id: 'compras',   label: 'Inbound', icon: '📥' },
  { id: 'estoque',   label: 'Inventory', icon: '📦' },
  { id: 'precos',    label: 'Config', icon: '⚙️' },
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
      {/* 🔮 THE OBSIDIAN SIDEBAR */}
      <aside className="sidebar">
        <div style={{ marginBottom: 60, display: 'flex', justifyContent: 'center' }}>
           <Logo size={48} showText={false} />
        </div>

        <nav style={{ flex: 1 }}>
          {MENU.map(item => (
            <div 
              key={item.id} 
              className={`nav-link ${active === item.id ? 'active' : ''}`}
              onClick={() => setActive(item.id)}
            >
              <span style={{ fontSize: 20 }}>{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}
        </nav>

        {/* PROFILE SECTION — PREMIUM FINISH */}
        <div style={{ 
          marginTop: 'auto', 
          background: 'rgba(255,255,255,0.03)', 
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)', 
          padding: '20px', 
          display: 'flex', 
          alignItems: 'center', 
          gap: 12
        }}>
           <div style={{ 
             width: 40, height: 40, borderRadius: 10, 
             background: 'var(--wp-yellow)', color: '#000', 
             display: 'flex', alignItems: 'center', justifyContent: 'center', 
             fontWeight: 900, fontSize: 14, boxShadow: 'var(--glow-gold)' 
           }}>
              {currentUser?.nome?.[0] || 'A'}
           </div>
           <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#FFF' }}>{currentUser?.nome}</div>
              <div style={{ fontSize: 11, color: 'var(--text-dark)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Operator</div>
           </div>
           <button onClick={logout} style={{ background: 'transparent', border: 'none', color: 'var(--text-dark)', cursor: 'pointer', fontSize: 18, transition: '0.3s' }} onMouseOver={e => e.target.style.color='#FFF'} onMouseOut={e => e.target.style.color='var(--text-dark)'}>
              🚪
           </button>
        </div>
      </aside>

      {/* 🚀 THE STAGE */}
      <main className="stage">
        <header className="glass-header">
           <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--wp-yellow)', boxShadow: 'var(--glow-gold)' }}></div>
              <h2 style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--text-dark)' }}>
                 WavePod Systems / {MENU.find(m => m.id === active)?.label}
              </h2>
           </div>

           <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
              <div style={{ display: 'flex', gap: 20 }}>
                 <span style={{ cursor: 'pointer', color: 'var(--text-dim)' }}>🔍</span>
                 <span style={{ cursor: 'pointer', color: 'var(--text-dim)' }}>🔔</span>
              </div>
              <div style={{ width: 1, height: 24, background: 'var(--border)' }}></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                 <div style={{ fontSize: 11, fontWeight: 900, color: 'var(--text-dark)' }}>VER. 10.0</div>
              </div>
           </div>
        </header>

        <section style={{ maxWidth: 1400, margin: '0 auto' }}>
           <RenderPage />
        </section>
      </main>
    </div>
  )
}
