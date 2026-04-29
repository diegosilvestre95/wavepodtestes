import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import Dashboard from './admin/Dashboard'
import Vendas    from './admin/Vendas'
import Compras   from './admin/Compras'
import Estoque   from './admin/Estoque'
import Precos    from './admin/Precos'
import Pedidos   from './admin/Pedidos'
import Logo      from '../components/Logo'

const SLIM_NAV = [
  { id: 'dashboard', icon: '🏠' },
  { id: 'pedidos',   icon: '📋' },
  { id: 'vendas',    icon: '💸' },
  { id: 'compras',   icon: '📦' },
  { id: 'estoque',   icon: '🗃️' },
  { id: 'precos',    icon: '💰' },
  { id: 'config',    icon: '⚙️' },
]

export default function Admin() {
  const { currentUser, logout } = useApp()
  const navigate = useNavigate()
  const [tela, setTela] = useState('dashboard')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'dark')
  }, [])

  useEffect(() => {
    if (!currentUser) navigate('/login')
  }, [currentUser, navigate])

  const COMPONENTES = { dashboard: Dashboard, vendas: Vendas, compras: Compras, estoque: Estoque, precos: Precos, pedidos: Pedidos }
  const Componente = COMPONENTES[tela] || Dashboard

  return (
    <div className="admin-layout">
      {/* SLIM SIDEBAR (iPad MOCKUP) */}
      <aside className="slim-sidebar">
        <div style={{ marginBottom: 40 }}>
           <Logo size={40} showText={false} light />
        </div>
        
        {SLIM_NAV.map(item => (
          <div key={item.id} 
               className={`slim-nav-item ${tela === item.id ? 'active' : ''}`}
               onClick={() => setTela(item.id)}>
            {item.icon}
          </div>
        ))}

        <div style={{ marginTop: 'auto' }} className="slim-nav-item" onClick={logout}>
           🚪
        </div>
      </aside>

      {/* DASHBOARD STAGE */}
      <main className="dash-stage">
        <header className="dash-header-ipad">
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
             <Logo size={44} light />
          </div>
          
          <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
             <span style={{ fontSize: 20, opacity: 0.5 }}>❓</span>
             <span style={{ fontSize: 20, opacity: 0.5, position: 'relative' }}>
               🔔
               <div style={{ position: 'absolute', top: -5, right: -5, background: 'var(--wp-yellow)', width: 8, height: 8, borderRadius: '50%' }}></div>
             </span>
             <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#fff', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 11 }}>WP</div>
          </div>
        </header>

        <div style={{ flex: 1 }}>
           <Componente />
        </div>
      </main>
    </div>
  )
}
