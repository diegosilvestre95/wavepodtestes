import { useState, useEffect, useMemo } from 'react'
import { sb } from '../../lib/supabase'
import { fmt } from '../../lib/utils'
import StatCard from '../../components/admin/StatCard'

export default function Dashboard() {
  const [vendas, setVendas] = useState([])
  const [compras, setCompras] = useState([])
  const [pedidos, setPedidos] = useState([])
  const [loading, setLoading] = useState(true)

  const carregarDados = async () => {
    setLoading(true)
    const [v, c, p] = await Promise.all([
      sb.from('vendas').select('*').order('data', { ascending: false }),
      sb.from('compras').select('*'),
      sb.from('pedidos').select('*').order('created_at', { ascending: false })
    ])
    
    setVendas(v.data || [])
    setCompras(c.data || [])
    setPedidos(p.data || [])
    setLoading(false)
  }

  useEffect(() => { carregarDados() }, [])

  const stats = useMemo(() => {
    const investido = compras.reduce((a, b) => a + (parseFloat(b.custo || 0) * parseInt(b.quantidade || 0)) + parseFloat(b.frete || 0), 0)
    const fatVendas = vendas.reduce((a, b) => a + (parseFloat(b.preco_venda || 0) * parseInt(b.quantidade || 0)), 0)
    const fatPedidos = pedidos.filter(p => p.status === 'Confirmado').reduce((a, b) => a + parseFloat(b.total || 0), 0)

    const faturamento = fatVendas + fatPedidos
    const lucroLiquido = faturamento - investido
    const margem = faturamento > 0 ? (lucroLiquido / faturamento) * 100 : 0
    const porSocio = lucroLiquido / 2

    return { investido, faturamento, lucroLiquido, margem, porSocio }
  }, [vendas, compras, pedidos])

  if (loading) return <div style={{ padding: 40, color: '#666', fontSize: 13 }}>Sincronizando métricas de performance...</div>

  return (
    <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32 }}>
         <div>
            <h1>Dashboard</h1>
            <p className="subtext">Análise consolidada de performance e ativos operacionais.</p>
         </div>
         <button className="btn-primary" onClick={carregarDados} style={{ height: 32, fontSize: 11, padding: '0 16px' }}>
            ATUALIZAR DADOS
         </button>
      </div>

      <div className="ipad-grid">
         <StatCard label="Investimento Total" value={stats.investido} color="#3b82f6" subtext="Compras e fretes" />
         <StatCard label="Receita Bruta" value={stats.faturamento} color="var(--wp-yellow)" subtext="Vendas + Pedidos" />
         <StatCard label="Lucro Líquido" value={stats.lucroLiquido} color="#10b981" subtext={`Margem: ${stats.margem.toFixed(1)}%`} />
         <StatCard label="Divisão por Sócio" value={stats.porSocio} color="#f59e0b" subtext="Cota de 50%" />
      </div>

      <div className="ipad-grid" style={{ gridTemplateColumns: '2fr 1.2fr' }}>
         {/* TABELA DE VENDAS */}
         <div className="premium-table-wrap">
            <div style={{ padding: '16px 20px', background: '#050505', borderBottom: '1px solid var(--border-subtle)' }}>
               <div className="label-caps">Últimas Vendas Manuais</div>
            </div>
            <table>
               <thead>
                  <tr>
                     <th>Produto / Modelo</th>
                     <th>Sabor</th>
                     <th>Qtd</th>
                     <th>Valor</th>
                  </tr>
               </thead>
               <tbody>
                  {vendas.slice(0, 8).map(v => (
                     <tr key={v.id}>
                        <td style={{ fontWeight: 700 }}>{v.nome_produto}</td>
                        <td style={{ color: '#94a3b8' }}>{v.sabor_produto}</td>
                        <td style={{ fontWeight: 600 }}>{v.quantidade} un</td>
                        <td style={{ fontWeight: 800, color: 'var(--wp-yellow)' }}>R$ {fmt(v.preco_venda)}</td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>

         {/* STATUS DE PEDIDOS */}
         <div className="premium-table-wrap">
            <div style={{ padding: '16px 20px', background: '#050505', borderBottom: '1px solid var(--border-subtle)' }}>
               <div className="label-caps">Status de Pedidos</div>
            </div>
            <table>
               <thead>
                  <tr>
                     <th>ID</th>
                     <th>Valor</th>
                     <th style={{ textAlign: 'right' }}>Status</th>
                  </tr>
               </thead>
               <tbody>
                  {pedidos.slice(0, 8).map(p => (
                     <tr key={p.id}>
                        <td style={{ fontSize: 11, color: '#94a3b8' }}>#{String(p.id).slice(-6)}</td>
                        <td style={{ fontWeight: 700 }}>R$ {fmt(p.total)}</td>
                        <td style={{ textAlign: 'right' }}>
                           <span style={{ 
                             fontSize: 9, fontWeight: 900, 
                             color: p.status === 'Confirmado' ? '#10b981' : '#475569' 
                           }}>
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
