import { useState, useEffect } from 'react'
import { sb } from '../../lib/supabase'
import { fmt } from '../../lib/utils'

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  const carregar = async () => {
    setLoading(true)
    const [
      { data: vendas },
      { data: pedidos },
      { data: histComp },
    ] = await Promise.all([
      sb.from('vendas').select('*'),
      sb.from('pedidos').select('*').order('created_at', { ascending: false }).limit(8),
      sb.from('historico').select('valor').eq('tipo', 'Compra'),
    ])

    const totalInvestido = (histComp || []).reduce((a, h) => a + parseFloat(h.valor || 0), 0)
    const totalReceita   = (vendas || []).reduce((a, v) => a + parseFloat(v.preco_venda || 0) * (v.quantidade || 1), 0)
    const lucro          = totalReceita - totalInvestido

    setStats({ totalReceita, lucro, pedidosRecentes: pedidos || [] })
    setLoading(false)
  }

  useEffect(() => {
    carregar()
  }, [])

  if (loading) return <div style={{ padding: 40, color: '#999' }}>Sincronizando Painel Administrativo...</div>

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      <div className="dash-title-area">
         <h1>Painel do Administrador</h1>
         <p>Gestão centralizada de vendas, estoque e performance operacional.</p>
      </div>

      {/* KPI METÁLICOS COM SPARKLINE */}
      <div className="kpi-row">
         <div className="kpi-card-metallic">
            <div className="kpi-label">Pedidos Pendentes</div>
            <div className="kpi-value">R$ {fmt(stats.totalReceita * 0.1)}</div>
            <div className="kpi-growth">+ R$ 1.200,00 este mês</div>
            <svg className="sparkline-svg" viewBox="0 0 400 100" preserveAspectRatio="none">
               <path d="M0,80 Q50,20 100,70 T200,40 T300,60 T400,20" fill="none" stroke="var(--wp-gold)" strokeWidth="3" />
            </svg>
         </div>
         <div className="kpi-card-metallic">
            <div className="kpi-label">Receita Total</div>
            <div className="kpi-value">R$ {fmt(stats.totalReceita)}</div>
            <div className="kpi-growth">+ 12.5% vs período anterior</div>
            <svg className="sparkline-svg" viewBox="0 0 400 100" preserveAspectRatio="none">
               <path d="M0,90 Q80,10 160,80 T320,30 T400,50" fill="none" stroke="var(--wp-gold)" strokeWidth="3" />
            </svg>
         </div>
      </div>

      <div className="dash-grid-main">
         {/* COLUNA ESQUERDA: GESTÃO DE PEDIDOS */}
         <div className="section-card">
            <div className="section-header">
               <h2>Gestão de Pedidos</h2>
               <button className="btn-select">Filtrar por Status ⌵</button>
            </div>
            <table className="table-premium">
               <thead>
                  <tr>
                     <th style={{ width: 40 }}><input type="checkbox" /></th>
                     <th>Nome</th>
                     <th>Data</th>
                     <th>Status</th>
                     <th>Ações</th>
                  </tr>
               </thead>
               <tbody>
                  {stats.pedidosRecentes.map(p => (
                     <tr key={p.id}>
                        <td><input type="checkbox" /></td>
                        <td>{p.cliente_nome} {p.cliente_sobrenome}</td>
                        <td style={{ color: '#888' }}>{new Date(p.created_at).toLocaleDateString()}</td>
                        <td>{p.status}</td>
                        <td>
                           <span className="action-circle"></span>
                           <span style={{ fontSize: 11, fontWeight: 800 }}>GERENCIAR</span>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>

         {/* COLUNA DIREITA: PAINÉIS LATERAIS */}
         <div className="right-panels">
            <div className="panel-metallic">
               <div className="panel-header-metallic">
                  <span>Configurações</span>
                  <span style={{ opacity: 0.5 }}>→</span>
               </div>
               <div className="panel-list-item">
                  <span>📦 Produtos</span>
                  <span style={{ opacity: 0.4 }}>›</span>
               </div>
               <div className="panel-list-item">
                  <span>💎 Produtos Premium</span>
                  <span style={{ opacity: 0.4 }}>›</span>
               </div>
               <div className="panel-list-item">
                  <span>🔍 Compras e Clientes</span>
                  <span style={{ opacity: 0.4 }}>›</span>
               </div>
            </div>

            <div className="panel-metallic">
               <div className="panel-header-metallic">
                  <span>Ações Rápidas</span>
                  <button className="btn-select" style={{ background: 'transparent' }}>Período ⌵</button>
               </div>
               {['Relatório Geral', 'Backup de Dados', 'Sincronizar API', 'Logs do Sistema'].map(item => (
                  <div key={item} className="panel-list-item">
                     <span>{item}</span>
                     <span style={{ fontSize: 10, color: '#999', fontWeight: 800 }}>EXECUTAR</span>
                  </div>
               ))}
            </div>
         </div>
      </div>
    </div>
  )
}
