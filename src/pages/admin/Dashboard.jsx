import { useState, useEffect, useMemo } from 'react'
import { sb } from '../../lib/supabase'
import { fmt } from '../../lib/utils'

export default function Dashboard() {
  const [vendas, setVendas] = useState([])
  const [compras, setCompras] = useState([])
  const [pedidos, setPedidos] = useState([])
  const [loading, setLoading] = useState(true)

  const carregarDados = async () => {
    setLoading(true)
    // Busca todas as transações para o cálculo do ERP
    const { data: v } = await sb.from('vendas').select('*')
    const { data: c } = await sb.from('compras').select('*')
    const { data: p } = await sb.from('pedidos').select('*')
    
    setVendas(v || [])
    setCompras(c || [])
    setPedidos(p || [])
    setLoading(false)
  }

  useEffect(() => { carregarDados() }, [])

  // 🧮 LÓGICA ERP (Cálculos Societários)
  const stats = useMemo(() => {
    const investido = compras.reduce((a, b) => a + parseFloat(b.investimento_total || 0), 0)
    const faturamento = vendas.reduce((a, b) => a + (parseFloat(b.preco_venda || 0) * parseInt(b.quantidade || 0)), 0)
    const lucroLiquido = faturamento - investido
    const margem = faturamento > 0 ? (lucroLiquido / faturamento) * 100 : 0
    const porSocio = lucroLiquido / 2

    return { investido, faturamento, lucroLiquido, margem, porSocio }
  }, [vendas, compras])

  if (loading) return <div style={{ padding: 40, color: '#666' }}>Calculando lucros e dividendos...</div>

  return (
    <div style={{ animation: 'fadeIn 0.6s ease-out' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}>
         <div>
            <h1 style={{ fontSize: 32, fontWeight: 800 }}>Visão Geral ERP</h1>
            <p style={{ color: '#666', fontSize: 14 }}>Controle de investimento, faturamento e divisão de lucros entre sócios.</p>
         </div>
         <button className="btn-action" onClick={carregarDados}>🔄 ATUALIZAR DADOS</button>
      </div>

      {/* CARDS FINANCEIROS (LÓGICA DOS SÓCIOS) */}
      <div className="ipad-grid" style={{ marginBottom: 30 }}>
         
         <div className="ipad-card" style={{ borderLeft: '4px solid #3b82f6' }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: '#666', marginBottom: 10 }}>TOTAL INVESTIDO</div>
            <div style={{ fontSize: 28, fontWeight: 800 }}>R$ {fmt(stats.investido)}</div>
            <div style={{ fontSize: 11, color: '#444', marginTop: 8 }}>Soma das compras realizadas</div>
         </div>

         <div className="ipad-card" style={{ borderLeft: '4px solid var(--wp-yellow)' }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: '#666', marginBottom: 10 }}>RECEITA TOTAL</div>
            <div style={{ fontSize: 28, fontWeight: 800 }}>R$ {fmt(stats.faturamento)}</div>
            <div style={{ fontSize: 11, color: '#444', marginTop: 8 }}>Vendas + Pedidos finalizados</div>
         </div>

         <div className="ipad-card" style={{ borderLeft: `4px solid ${stats.lucroLiquido >= 0 ? '#10b981' : '#ef4444'}` }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: '#666', marginBottom: 10 }}>LUCRO LÍQUIDO</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: stats.lucroLiquido >= 0 ? '#10b981' : '#ef4444' }}>
               R$ {fmt(stats.lucroLiquido)}
            </div>
            <div style={{ fontSize: 11, color: '#444', marginTop: 8 }}>Margem: {stats.margem.toFixed(1)}%</div>
         </div>

         <div className="ipad-card" style={{ background: 'linear-gradient(145deg, #18181b 0%, #1e1e22 100%)', border: '1px solid rgba(255,215,0,0.2)' }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--wp-yellow)', marginBottom: 10 }}>LUCRO POR SÓCIO (50%)</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--wp-yellow)' }}>R$ {fmt(stats.porSocio)}</div>
            <div style={{ fontSize: 11, color: 'rgba(255,215,0,0.5)', marginTop: 8 }}>Divisão automática societária</div>
         </div>

      </div>

      <div className="ipad-grid">
         {/* PERFORMANCE VISUAL */}
         <div className="ipad-card">
            <div style={{ fontWeight: 800, marginBottom: 20 }}>Receita por Operação</div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, height: 160, paddingBottom: 20 }}>
               {vendas.slice(-10).map((v, i) => (
                  <div key={i} style={{ 
                     flex: 1, 
                     height: `${(v.preco_venda / stats.faturamento) * 500}%`, 
                     minHeight: '20%',
                     background: 'linear-gradient(to top, var(--wp-yellow), #b8860b)',
                     borderRadius: '6px 6px 0 0',
                     opacity: 0.8
                  }}></div>
               ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#444', fontWeight: 800 }}>
               <span>INÍCIO</span><span>HISTÓRICO RECENTE</span><span>HOJE</span>
            </div>
         </div>

         {/* LISTA RÁPIDA DE VENDAS */}
         <div className="ipad-card" style={{ padding: 0 }}>
            <div style={{ padding: 25, fontWeight: 800 }}>Últimas Operações</div>
            <table className="table-ipad" style={{ fontSize: 12 }}>
               <thead>
                  <tr>
                     <th>PRODUTO</th>
                     <th>QTD</th>
                     <th>VALOR</th>
                  </tr>
               </thead>
               <tbody>
                  {vendas.slice(-6).reverse().map(v => (
                     <tr key={v.id}>
                        <td>ID: {String(v.produto_id).slice(0,5)}</td>
                        <td>{v.quantidade} un</td>
                        <td style={{ fontWeight: 800, color: 'var(--wp-yellow)' }}>R$ {fmt(v.preco_venda)}</td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>

    </div>
  )
}
