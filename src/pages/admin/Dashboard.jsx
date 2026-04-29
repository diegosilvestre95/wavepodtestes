import { useState, useEffect } from 'react'
import { sb } from '../../lib/supabase'
import { fmt } from '../../lib/utils'

export default function Dashboard() {
  const [stats, setStats]   = useState(null)
  const [loading, setLoading] = useState(true)

  const carregar = async () => {
    setLoading(true)
    const [
      { data: vendas },
      { data: pedidos },
      { data: histComp },
      { data: produtos },
    ] = await Promise.all([
      sb.from('vendas').select('*'),
      sb.from('pedidos').select('total,status').neq('status', 'Cancelado').neq('status', 'Pendente'),
      sb.from('historico').select('valor').eq('tipo', 'Compra'),
      sb.from('produtos').select('*'),
    ])

    const totalInvestido = (histComp || []).reduce((a, h) => a + parseFloat(h.valor || 0), 0)
    const recVendas      = (vendas  || []).reduce((a, v) => a + parseFloat(v.preco_venda || 0) * parseInt(v.quantidade || 0), 0)
    const recPedidos     = (pedidos || []).reduce((a, p) => a + parseFloat(p.total || 0), 0)
    const totalReceita   = recVendas + recPedidos
    const lucro          = totalReceita - totalInvestido
    const margem         = totalReceita > 0 ? (lucro / totalReceita * 100) : 0

    const allVals = [
      ...(vendas  || []).map(v => parseFloat(v.preco_venda || 0) * parseInt(v.quantidade || 1)),
      ...(pedidos || []).map(p => parseFloat(p.total || 0)),
    ]

    setStats({ totalInvestido, totalReceita, lucro, margem, allVals, produtos: produtos || [] })
    setLoading(false)
  }

  useEffect(() => {
    carregar()
    const onPed = () => carregar()
    window.addEventListener('wvpod:pedidoatualizado', onPed)
    window.addEventListener('wvpod:novopedido', onPed)
    return () => {
      window.removeEventListener('wvpod:pedidoatualizado', onPed)
      window.removeEventListener('wvpod:novopedido', onPed)
    }
  }, [])

  if (loading) return <div style={{ padding: 60, color: '#999', fontSize: 14 }}>Sincronizando base de dados estratégica...</div>
  
  const { totalReceita, lucro, margem, produtos } = stats

  return (
    <div className="admin-wrapper" style={{ animation: 'fadeIn 0.6s ease-out' }}>
      {/* HEADER DASHBOARD */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 48 }}>
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: '#000', letterSpacing: '-0.03em' }}>Visão Estratégica</h1>
          <p style={{ color: '#888', fontSize: 14, marginTop: 4 }}>Monitoramento de KPIs e performance de vendas.</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
            <button className="btn-primary" onClick={carregar} style={{ padding: '12px 20px', background: '#f1f3f5', color: '#000', boxShadow: 'none' }}>ATUALIZAR</button>
            <div className="btn-primary" style={{ padding: '12px 24px', cursor: 'default' }}>LIVE STATUS</div>
        </div>
      </div>

      {/* KPI GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, marginBottom: 48 }}>
        <div className="stat-card-premium">
          <div className="stat-label">Volume de Vendas</div>
          <div className="stat-main-val">R$ {fmt(totalReceita)}</div>
          <div style={{ fontSize: 12, color: '#22c55e', marginTop: 12, fontWeight: 700 }}>↑ 12.5% vs mês anterior</div>
        </div>
        
        <div className="stat-card-premium">
          <div className="stat-label">Lucro Líquido</div>
          <div className="stat-main-val" style={{ color: lucro >= 0 ? '#000' : '#ef4444' }}>
             R$ {fmt(lucro)}
          </div>
          <div style={{ fontSize: 12, color: '#888', marginTop: 12, fontWeight: 600 }}>Ponto de equilíbrio atingido</div>
        </div>

        <div className="stat-card-premium">
          <div className="stat-label">Margem de Lucro</div>
          <div className="stat-main-val" style={{ color: 'var(--wp-yellow)', background: '#000', padding: '4px 12px', borderRadius: '8px', display: 'inline-block' }}>
            {margem.toFixed(1)}%
          </div>
          <div style={{ fontSize: 12, color: '#888', marginTop: 12, fontWeight: 600 }}>Otimização recomendada</div>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 32 }}>
        
        <div className="premium-table-wrap">
          <div style={{ padding: '24px 32px', borderBottom: '1px solid #f1f3f5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: 18, fontWeight: 700 }}>Pedidos Recentes</h3>
            <span style={{ fontSize: 12, color: '#999', fontWeight: 600 }}>{produtos.length} OPERAÇÕES</span>
          </div>
          <table>
            <thead>
              <tr>
                <th>Identificador</th>
                <th>Data</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {produtos.slice(0, 8).map(p => (
                <tr key={p.id}>
                  <td style={{ fontWeight: 700, color: '#000' }}>#{p.id.slice(0,6).toUpperCase()}</td>
                  <td style={{ color: '#888' }}>29 Abr, 2026</td>
                  <td><span className="status-chip success">Concluído</span></td>
                  <td><span style={{ color: '#000', fontWeight: 800, cursor: 'pointer', fontSize: 12, textDecoration: 'underline' }}>VER LOG</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div className="stat-card-premium" style={{ background: '#1a1a1a', border: 'none' }}>
            <div className="stat-label" style={{ color: 'var(--wp-yellow)' }}>Atalhos Rápidos</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 16 }}>
              {['Relatórios Avançados', 'Gerenciar Estoque', 'Cupons de Desconto', 'API Settings'].map(item => (
                <div key={item} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', color: '#fff' }}>
                  <span style={{ fontWeight: 600, fontSize: 13 }}>{item}</span>
                  <span style={{ opacity: 0.3 }}>→</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
