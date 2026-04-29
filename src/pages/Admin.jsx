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
  dashboard: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>,
  pedidos:   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>,
  vendas:    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>,
  compras:   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>,
  estoque:   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path></svg>,
  precos:    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>,
  config:    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
}

const MENU_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: Icons.dashboard },
  { id: 'pedidos',   label: 'Pedidos', icon: Icons.pedidos },
  { id: 'vendas',    label: 'Vendas', icon: Icons.vendas },
  { id: 'compras',   label: 'Compras', icon: Icons.compras },
  { id: 'estoque',   label: 'Estoque', icon: Icons.estoque },
  { id: 'precos',    label: 'Preços', icon: Icons.precos },
  { id: 'config',    label: 'Ajustes', icon: Icons.config },
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
    estoque: Estoque, precos: Precos, pedidos: Pedidos,
    config: () => <div style={{ padding: 40 }}><h1 style={{ color: '#fff' }}>Painel de Ajustes</h1><p className="subtext">Configure parâmetros globais do ERP.</p></div>
  }[active] || Dashboard

  return (
    <div className="admin-layout">
      {/* SIDEBAR FIXA */}
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
          <div className="slim-nav-item" onClick={logout} title="Sair do Sistema">
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
          </div>
        </div>
      </aside>

      {/* ÁREA DE CONTEÚDO */}
      <main className="dash-stage">
        <header className="admin-header">
           <div className="search-engine-wrap" style={{ position: 'relative' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              <input 
                type="text" 
                placeholder="Pesquisar estoque, vendas, preços..." 
                value={search}
                onChange={e => { setSearch(e.target.value); setShowSearchBox(true); }}
                onFocus={() => setShowSearchBox(true)}
              />
              {showSearchBox && filteredNav.length > 0 && (
                <div style={{ position: 'absolute', top: 55, left: 0, right: 0, background: '#0a0a0c', border: '1px solid var(--border-subtle)', borderRadius: 12, zIndex: 100, boxShadow: '0 20px 50px rgba(0,0,0,0.8)', overflow: 'hidden' }}>
                   {filteredNav.map(item => (
                      <div 
                        key={item.id} 
                        onClick={() => { setActive(item.id); setSearch(''); setShowSearchBox(false); }}
                        style={{ padding: '14px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid var(--border-subtle)' }}
                        className="search-result-item"
                      >
                         <div style={{ color: 'var(--wp-yellow)' }}>{item.icon}</div>
                         <span style={{ fontSize: 13, color: '#f8fafc', fontWeight: 600 }}>{item.label}</span>
                      </div>
                   ))}
                </div>
             )}
           </div>

           <div className="user-pill mobile-hidden" style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#050505', padding: '6px 14px', borderRadius: 10, border: '1px solid var(--border-subtle)' }}>
              <div style={{ width: 24, height: 24, borderRadius: 6, background: 'var(--wp-yellow)', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 9 }}>W</div>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>{currentUser?.nome || 'Admin'}</span>
           </div>
        </header>

        <div className="content-render">
           <Componente />
        </div>
      </main>

      {/* NAVEGAÇÃO MOBILE (BOTTOM NAV) */}
      <nav className="bottom-nav mobile-only">
        {MENU_ITEMS.slice(0, 5).map(item => (
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
    </div>
  )
}
