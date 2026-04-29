import { useState, useEffect, useMemo } from 'react'
import { sb } from '../../lib/supabase'
import { fmt } from '../../lib/utils'

export default function Dashboard() {
  const [pedidos, setPedidos] = useState([])
  const [clientes, setClientes] = useState([])
  const [clienteSel, setClienteSel] = useState('all') // 'all' ou nome do cliente
  const [loading, setLoading] = useState(true)

  const carregar = async () => {
    setLoading(true)
    const { data: p } = await sb.from('pedidos').select('*').order('created_at', { ascending: false })
    setPedidos(p || [])
    
    // Extrair clientes únicos dos pedidos
    const names = Array.from(new Set((p || []).map(i => `${i.cliente_nome} ${i.cliente_sobrenome}`)))
    setClientes(names)
    setLoading(false)
  }

  useEffect(() => {
    carregar()
  }, [])

  const filtered = useMemo(() => {
    if (clienteSel === 'all') return pedidos
    return pedidos.filter(p => `${p.cliente_nome} ${p.cliente_sobrenome}` === clienteSel)
  }, [pedidos, clienteSel])

  const totalVendas = filtered.reduce((a, b) => a + parseFloat(b.total || 0), 0)

  if (loading) return <div style={{ padding: 40, color: '#666' }}>Carregando métricas de vendas...</div>

  return (
    <div style={{ animation: 'fadeIn 0.6s ease-out' }}>
      
      {/* HEADER DO DASHBOARD (IPAD STYLE) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}>
         <div>
            <h1 style={{ fontSize: 32, fontWeight: 800 }}>Dashboard de Vendas</h1>
            <p style={{ color: '#666', fontSize: 14 }}>Análise detalhada de performance e comportamento de clientes.</p>
         </div>

         <div className="client-filter">
            <span style={{ opacity: 0.5 }}>📅</span>
            <select 
              className="dark-select" 
              value={clienteSel} 
              onChange={(e) => setClienteSel(e.target.value)}
            >
               <option value="all">Visão Geral (Todos)</option>
               {clientes.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
         </div>
      </div>

      <div className="ipad-grid">
         {/* COLUNA ESQUERDA: GRÁFICOS */}
         <div style={{ display: 'flex', flexDirection: 'column', gap: 30 }}>
            
            <div className="ipad-card">
               <div className="ipad-card-title">
                  <span>Performance Semanal</span>
                  <select className="dark-select" style={{ fontSize: 12, opacity: 0.5 }}><option>Vendas ⌵</option></select>
               </div>
               <div className="bar-chart-container">
                  {[45, 78, 62, 95, 55, 88, 72].map((h, i) => (
                    <div key={i} className="bar-item" style={{ height: `${h}%` }}></div>
                  ))}
               </div>
               <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 20, color: '#444', fontSize: 11, fontWeight: 800 }}>
                  <span>SEG</span><span>TER</span><span>QUA</span><span>QUI</span><span>SEX</span><span>SAB</span><span>DOM</span>
               </div>
            </div>

            <div className="ipad-card">
               <div className="ipad-card-title">Produtos Populares</div>
               <div style={{ height: 140, position: 'relative', marginTop: 20 }}>
                  <svg width="100%" height="100%" viewBox="0 0 400 100" preserveAspectRatio="none">
                    <path d="M0,80 Q50,20 100,70 T200,40 T300,60 T400,20" fill="rgba(255,215,0,0.1)" stroke="var(--wp-yellow)" strokeWidth="3" />
                  </svg>
               </div>
               <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, color: '#444', fontSize: 10, fontWeight: 800 }}>
                  <span>ADO</span><span>ABR</span><span>MAR</span><span>AGR</span><span>SET</span><span>OUT</span><span>DEZ</span>
               </div>
            </div>

         </div>

         {/* COLUNA DIREITA: KPI E TRANSAÇÕES */}
         <div style={{ display: 'flex', flexDirection: 'column', gap: 30 }}>
            
            <div className="metric-card-group">
               <div className="metric-mini-card">
                  <div className="metric-label">Vendas Totais</div>
                  <div className="metric-val">R$ {fmt(totalVendas)}</div>
                  <div style={{ display: 'flex', gap: 4, height: 20, alignItems: 'flex-end' }}>
                     {[3,8,5,10].map((v,i) => <div key={i} style={{ width: 4, height: v*2, background: 'var(--wp-yellow)', borderRadius: 2 }}></div>)}
                  </div>
               </div>
               <div className="metric-mini-card">
                  <div className="metric-label">Novos Clientes</div>
                  <div className="metric-val">{clientes.length}</div>
                  <div style={{ position: 'absolute', right: 25, bottom: 25, fontSize: 24, opacity: 0.2 }}>👤</div>
               </div>
            </div>

            <div className="ipad-card" style={{ padding: 0, overflow: 'hidden' }}>
               <div style={{ padding: 25 }}>
                  <div className="ipad-card-title">Transações Frequentes</div>
               </div>
               <table className="table-ipad">
                  <thead>
                     <tr>
                        <th>NOME</th>
                        <th>DATA</th>
                        <th>STATUS</th>
                     </tr>
                  </thead>
                  <tbody>
                     {filtered.slice(0, 5).map(p => (
                        <tr key={p.id}>
                           <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                 <div className="prod-thumb">💨</div>
                                 <div>
                                    <div style={{ fontWeight: 700 }}>{p.cliente_nome}</div>
                                    <div style={{ fontSize: 10, color: '#555' }}>ID: {String(p.id).slice(0,6).toUpperCase()}</div>
                                 </div>
                              </div>
                           </td>
                           <td style={{ color: '#666' }}>{new Date(p.created_at).toLocaleDateString()}</td>
                           <td><span className="status-pill">● {p.status}</span></td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>

         </div>
      </div>
    </div>
  )
}
