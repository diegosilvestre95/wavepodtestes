import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import Dashboard from './admin/Dashboard'
import Vendas    from './admin/Vendas'
import Compras   from './admin/Compras'
import Estoque   from './admin/Estoque'
import Precos    from './admin/Precos'
import Pedidos   from './admin/Pedidos'
import Logo      from '../components/Logo'

const Icons = {
  dashboard: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>,
  pedidos:   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>,
  vendas:    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>,
  compras:   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>,
  estoque:   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path></svg>,
  precos:    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
}

const MENU_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: Icons.dashboard },
  { id: 'pedidos',   label: 'Pedidos', icon: Icons.pedidos },
  { id: 'vendas',    label: 'Vendas', icon: Icons.vendas },
  { id: 'compras',   label: 'Compras', icon: Icons.compras },
  { id: 'estoque',   label: 'Estoque', icon: Icons.estoque },
  { id: 'precos',    label: 'Preços', icon: Icons.precos },
]

export default function Admin() {
  const { currentUser, logout } = useApp()
  const navigate = useNavigate()
  const [active, setActive] = useState('dashboard')
  const [search, setSearch] = useState('')
  const [showSearchBox, setShowSearchBox] = useState(false)

  useEffect(() => {
    if (!currentUser) navigate('/login')
  }, [currentUser, navigate])

  const filteredNav = useMemo(() => {
    if (!search) return []
    return MENU_ITEMS.filter(i => i.label.toLowerCase().includes(search.toLowerCase()))
  }, [search])

  const Componente = { 
    dashboard: Dashboard, vendas: Vendas, compras: Compras, 
    estoque: Estoque, precos: Precos, pedidos: Pedidos 
  }[active] || Dashboard

  return (
    <div className="admin-layout">
      {/* 🖥️ DESKTOP ONLY: SIDEBAR */}
      <aside className="slim-sidebar desktop-only">
        <div style={{ marginBottom: 40 }}>
           <Logo size={32} showText={false} light />
        </div>
        
        {MENU_ITEMS.map(item => (
          <div 
            key={item.id} 
            className={`slim-nav-item ${active === item.id ? 'active' : ''}`}
            onClick={() => setActive(item.id)}
            title={item.label}
          >
            {item.icon}
          </div>
        ))}

        <div style={{ marginTop: 'auto' }}>
          <div className="slim-nav-item" onClick={logout} title="Sair">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
          </div>
        </div>
      </aside>

      {/* 🚀 STAGE (Sincronizado) */}
      <main className="dash-stage">
        <header className="admin-header">
           <div className="search-engine-wrap" style={{ position: 'relative' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3f3f46" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              <input 
                type="text" 
                placeholder="Pesquisar funções, produtos..." 
                value={search}
                onChange={e => { setSearch(e.target.value); setShowSearchBox(true); }}
                onFocus={() => setShowSearchBox(true)}
              />
              {showSearchBox && filteredNav.length > 0 && (
                <div style={{ position: 'absolute', top: 55, left: 0, right: 0, background: '#18181b', border: '1px solid #27272a', borderRadius: 12, zIndex: 100, boxShadow: '0 10px 30px rgba(0,0,0,0.5)', overflow: 'hidden' }}>
                   {filteredNav.map(item => (
                      <div 
                        key={item.id} 
                        onClick={() => { setActive(item.id); setSearch(''); setShowSearchBox(false); }}
                        style={{ padding: '12px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid #27272a' }}
                      >
                         <div style={{ color: 'var(--wp-yellow)' }}>{item.icon}</div>
                         <span style={{ fontSize: 13, color: '#e4e4e7', fontWeight: 600 }}>{item.label}</span>
                      </div>
                   ))}
                </div>
             )}
           </div>

           <div className="user-pill mobile-hidden">
              <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--wp-yellow)', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 10 }}>W</div>
              <span style={{ fontSize: 12, fontWeight: 700 }}>{currentUser?.nome || 'Admin'}</span>
           </div>
        </header>

        <div className="content-render">
           <Componente />
        </div>
      </main>

      {/* 📱 MOBILE ONLY: BOTTOM NAV */}
      <nav className="bottom-nav mobile-only">
        {MENU_ITEMS.map(item => (
          <div 
            key={item.id} 
            className={`bottom-item ${active === item.id ? 'active' : ''}`}
            onClick={() => setActive(item.id)}
          >
            {item.icon}
            <span>{item.label}</span>
          </div>
        ))}
      </nav>

      <style>{`
        .admin-layout { display: flex; min-height: 100vh; background: #09090b; width: 100%; }
        
        /* ISOLAMENTO TOTAL DE CONTEXTO */
        .desktop-only { display: flex !important; }
        .mobile-only { display: none !important; }

        .admin-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; }
        .search-engine-wrap { 
          background: #121212; border: 1px solid #1e1e22; border-radius: 12px; 
          padding: 0 18px; display: flex; align-items: center; gap: 14px; width: 400px; height: 48px;
        }
        .search-engine-wrap input { 
          background: transparent; border: none; color: #fff; font-size: 14px; 
          width: 100%; outline: none; height: 100%; display: flex; align-items: center;
        }
        
        .user-pill { 
          display: flex; align-items: center; gap: 12px; background: #121212; 
          padding: 6px 12px; border-radius: 12px; border: 1px solid #1e1e22;
        }

        .bottom-nav {
          position: fixed; bottom: 0; left: 0; right: 0; height: 75px;
          background: rgba(18, 18, 22, 0.95); backdrop-filter: blur(20px);
          border-top: 1px solid #1e1e22; display: flex; justify-content: space-around;
          align-items: center; padding: 0 10px; z-index: 1000;
        }
        .bottom-item { display: flex; flex-direction: column; align-items: center; gap: 6px; color: #52525b; transition: 0.2s; cursor: pointer; }
        .bottom-item svg { width: 20px; height: 20px; }
        .bottom-item span { font-size: 8px; font-weight: 800; text-transform: uppercase; }
        .bottom-item.active { color: var(--wp-yellow); }

        @media (max-width: 768px) {
          .desktop-only { display: none !important; }
          .mobile-only { display: flex !important; }
          .dash-stage { padding: 20px 15px 100px 15px !important; margin-left: 0 !important; }
          .search-engine-wrap { width: 100%; }
          .mobile-hidden { display: none !important; }
        }
      `}</style>
    </div>
  )
}
