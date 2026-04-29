import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { sb } from '../lib/supabase'
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
  const { currentUser, logout, toast } = useApp()
  const navigate = useNavigate()
  const [active, setActive] = useState('dashboard')
  const [iaAtiva, setIaAtiva] = useState(true)

  useEffect(() => {
    if (!currentUser) navigate('/login')
    carregarConfig()
  }, [currentUser, navigate])

  const carregarConfig = async () => {
    const { data } = await sb.from('config').select('*').eq('chave', 'ia_ativa').single()
    if (data) setIaAtiva(data.valor === 'true')
  }

  const toggleIA = async () => {
    const novoEstado = !iaAtiva
    const { error } = await sb.from('config').upsert({ chave: 'ia_ativa', valor: String(novoEstado) })
    if (!error) {
      setIaAtiva(novoEstado)
      toast(`IA ${novoEstado ? 'Ativada' : 'Pausada'}`, novoEstado ? '🤖' : '⏸️')
    }
  }

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
              {/* OMNICHANNEL IA STATUS */}
              <div 
                onClick={toggleIA}
                style={{ 
                  display: 'flex', alignItems: 'center', gap: 8, 
                  background: iaAtiva ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                  padding: '6px 12px', borderRadius: 20, cursor: 'pointer',
                  border: `1px solid ${iaAtiva ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
                  transition: '0.2s'
                }}
              >
                 <div style={{ width: 8, height: 8, borderRadius: '50%', background: iaAtiva ? '#22c55e' : '#ef4444', boxShadow: iaAtiva ? '0 0 8px #22c55e' : 'none' }}></div>
                 <span style={{ fontSize: 10, fontWeight: 800, color: iaAtiva ? '#166534' : '#991b1b', textTransform: 'uppercase' }}>
                    IA {iaAtiva ? 'Ativa' : 'Pausada'}
                 </span>
              </div>

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
