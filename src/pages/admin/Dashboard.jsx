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
    const { data: v } = await sb.from('vendas').select('*').order('data', { ascending: false })
    const { data: c } = await sb.from('compras').select('*')
    const { data: p } = await sb.from('pedidos').select('*').order('created_at', { ascending: false })
    
    setVendas(v || [])
    setCompras(c || [])
    setPedidos(p || [])
    setLoading(false)
  }

  useEffect(() => { carregarDados() }, [])

  const stats = useMemo(() => {
    const investido = compras.reduce((a, b) => {
      const subtotal = (parseFloat(b.custo || 0) * parseInt(b.quantidade || 0))
      const freteItem = parseFloat(b.frete || 0)
      return a + subtotal + freteItem
    }, 0)

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
      
      {/* HEADER COMPACTO */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32 }}>
         <div>
            <h1>Dashboard</h1>
            <p className="subtext">Análise consolidada de performance e ativos operacionais.</p>
         </div>
         <button className="btn-primary" onClick={carregarDados} style={{ height: 32, fontSize: 11, padding: '0 16px' }}>
            ATUALIZAR DADOS
         </button>
      </div>

      {/* MÉTRICAS DE ALTA FIDELIDADE */}
      <div className="ipad-grid">
         <div className="ipad-card">
            <div className="label-caps" style={{ color: '#3b82f6' }}>Investimento Total</div>
            <div className="value-xl">R$ {fmt(stats.investido)}</div>
            <div style={{ fontSize: 11, color: '#475569', marginTop: 4 }}>Compras e fretes</div>
            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: '#3b82f6' }}></div>
         </div>

         <div className="ipad-card">
            <div className="label-caps" style={{ color: 'var(--wp-yellow)' }}>Receita Bruta</div>
            <div className="value-xl">R$ {fmt(stats.faturamento)}</div>
            <div style={{ fontSize: 11, color: '#475569', marginTop: 4 }}>Vendas + Pedidos</div>
            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: 'var(--wp-yellow)' }}></div>
         </div>

         <div className="ipad-card">
            <div className="label-caps" style={{ color: '#10b981' }}>Lucro Líquido</div>
            <div className="value-xl" style={{ color: '#10b981' }}>R$ {fmt(stats.lucroLiquido)}</div>
            <div style={{ fontSize: 11, color: '#475569', marginTop: 4 }}>Margem: {stats.margem.toFixed(1)}%</div>
            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: '#10b981' }}></div>
         </div>

         <div className="ipad-card">
            <div className="label-caps" style={{ color: '#f59e0b' }}>Divisão por Sócio</div>
            <div className="value-xl">R$ {fmt(stats.porSocio)}</div>
            <div style={{ fontSize: 11, color: '#475569', marginTop: 4 }}>Cota de 50%</div>
            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: '#f59e0b' }}></div>
         </div>
      </div>

      <div className="ipad-grid" style={{ gridTemplateColumns: '2fr 1.2fr' }}>
         {/* TABELA DE VENDAS DENSAS */}
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

         {/* TABELA DE PEDIDOS COMPACTA */}
         <div className="premium-table-wrap">
            <div style={{ padding: '16px 20px', background: '#050505', borderBottom: '1px solid var(--border-subtle)' }}>
               <div className="label-caps">Status de Pedidos</div>
            </div>
            <table>
               <thead>
                  <tr>
                     <th>Identificador</th>
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
