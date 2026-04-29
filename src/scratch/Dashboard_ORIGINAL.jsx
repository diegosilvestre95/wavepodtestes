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
    // Busca dados para o c├ílculo financeiro
    const { data: v } = await sb.from('vendas').select('*')
    const { data: c } = await sb.from('compras').select('*')
    const { data: p } = await sb.from('pedidos').select('*')
    
    setVendas(v || [])
    setCompras(c || [])
    setPedidos(p || [])
    setLoading(false)
  }

  useEffect(() => { carregarDados() }, [])

  // ­ƒº« L├ôGICA ERP CORRIGIDA (Sincronizada com Pedidos Confirmados)
  const stats = useMemo(() => {
    // 1. Investimento Total (Compras)
    const investido = compras.reduce((a, b) => a + parseFloat(b.investimento_total || 0), 0)

    // 2. Faturamento de Vendas Manuais
    const fatVendas = vendas.reduce((a, b) => a + (parseFloat(b.preco_venda || 0) * parseInt(b.quantidade || 0)), 0)

    // 3. Faturamento de Pedidos Confirmados (ESSA ERA A PE├çA QUE FALTA)
    const fatPedidos = pedidos
      .filter(p => p.status === 'Confirmado')
      .reduce((a, b) => a + parseFloat(b.total || 0), 0)

    const faturamento = fatVendas + fatPedidos
    const lucroLiquido = faturamento - investido
    const margem = faturamento > 0 ? (lucroLiquido / faturamento) * 100 : 0
    const porSocio = lucroLiquido / 2

    return { investido, faturamento, lucroLiquido, margem, porSocio }
  }, [vendas, compras, pedidos])

  if (loading) return <div style={{ padding: 40, color: '#666' }}>Sincronizando dados financeiros...</div>

  return (
    <div style={{ animation: 'fadeIn 0.6s ease-out' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}>
         <div>
            <h1 style={{ fontSize: 32, fontWeight: 800 }}>Vis├úo Geral ERP</h1>
            <p style={{ color: '#666', fontSize: 14 }}>Gest├úo unificada de vendas, pedidos e dividendos societ├írios.</p>
         </div>
         <button className="btn-action" onClick={carregarDados}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M23 4v6h-6"></path><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>
            Atualizar Dados
         </button>
      </div>

      <div className="ipad-grid" style={{ marginBottom: 30 }}>
         
         <div className="ipad-card" style={{ borderLeft: '4px solid #3b82f6' }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: '#666', marginBottom: 10 }}>TOTAL INVESTIDO</div>
            <div style={{ fontSize: 28, fontWeight: 800 }}>R$ {fmt(stats.investido)}</div>
            <div style={{ fontSize: 11, color: '#444', marginTop: 8 }}>Compras de estoque</div>
         </div>

         <div className="ipad-card" style={{ borderLeft: '4px solid var(--wp-yellow)' }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: '#666', marginBottom: 10 }}>RECEITA TOTAL</div>
            <div style={{ fontSize: 28, fontWeight: 800 }}>R$ {fmt(stats.faturamento)}</div>
            <div style={{ fontSize: 11, color: '#444', marginTop: 8 }}>Vendas + Pedidos Confirmados</div>
         </div>

         <div className="ipad-card" style={{ borderLeft: `4px solid ${stats.lucroLiquido >= 0 ? '#10b981' : '#ef4444'}` }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: '#666', marginBottom: 10 }}>LUCRO L├ìQUIDO</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: stats.lucroLiquido >= 0 ? '#10b981' : '#ef4444' }}>
               R$ {fmt(stats.lucroLiquido)}
            </div>
            <div style={{ fontSize: 11, color: '#444', marginTop: 8 }}>Margem Real: {stats.margem.toFixed(1)}%</div>
         </div>

         <div className="ipad-card" style={{ background: 'linear-gradient(145deg, #18181b 0%, #1e1e22 100%)', border: '1px solid rgba(255,215,0,0.2)' }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--wp-yellow)', marginBottom: 10 }}>LUCRO POR S├ôCIO (50%)</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--wp-yellow)' }}>R$ {fmt(stats.porSocio)}</div>
            <div style={{ fontSize: 11, color: 'rgba(255,215,0,0.5)', marginTop: 8 }}>C├ílculo societ├írio autom├ítico</div>
         </div>

      </div>

      <div className="ipad-grid">
         <div className="ipad-card">
            <div style={{ fontWeight: 800, marginBottom: 20 }}>Performance de Vendas</div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, height: 160, paddingBottom: 20 }}>
               {pedidos.filter(p => p.status === 'Confirmado').slice(-8).map((p, i) => (
                  <div key={i} style={{ 
                     flex: 1, 
                     height: `${(p.total / stats.faturamento) * 1000}%`, 
                     minHeight: '15%',
                     background: 'linear-gradient(to top, var(--wp-yellow), #b8860b)',
                     borderRadius: '6px 6px 0 0',
                     opacity: 0.8
                  }}></div>
               ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#444', fontWeight: 800 }}>
               <span>ANTIGOS</span><span>HIST├ôRICO DE CONFIRMADOS</span><span>RECENTES</span>
            </div>
         </div>

         <div className="ipad-card" style={{ padding: 0 }}>
            <div style={{ padding: 25, fontWeight: 800 }}>Fluxo de Caixa Recente</div>
            <table className="table-ipad" style={{ fontSize: 12 }}>
               <thead>
                  <tr>
                     <th>OPERA├ç├âO</th>
                     <th>VALOR</th>
                     <th>STATUS</th>
                  </tr>
               </thead>
               <tbody>
                  {pedidos.slice(0, 6).map(p => (
                     <tr key={p.id}>
                        <td style={{ color: '#52525b' }}>PEDIDO #{String(p.id).slice(0,4)}</td>
                        <td style={{ fontWeight: 800 }}>R$ {fmt(p.total)}</td>
                        <td>
                           <span style={{ color: p.status === 'Confirmado' ? '#10b981' : '#52525b', fontSize: 10, fontWeight: 900 }}>
                              {p.status.toUpperCase()}
                           </span>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>

    </div>
  )
}
