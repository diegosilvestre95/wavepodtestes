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

  if (loading) return <div className="empty"><span>⏳</span>Carregando inteligência de dados...</div>
  
  const { totalReceita, lucro, margem, produtos } = stats

  return (
    <div className="admin-wrapper" style={{ padding: 0 }}>
      {/* HEADER DASHBOARD */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 40 }}>
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: '#1a1a1a', letterSpacing: '-0.02em' }}>Painel do Administrador</h1>
          <p style={{ color: '#666', fontSize: 14 }}>Monitoramento estratégico e gestão de ativos WavePod.</p>
        </div>
        <div className="btn-primary" style={{ padding: '12px 24px', cursor: 'default', borderRadius: '40px' }}>
          <span style={{ width: 8, height: 8, background: '#000', borderRadius: '50%', display: 'inline-block', marginRight: 8, animation: 'pulse 1s infinite' }}></span>
          LIVE STATUS
        </div>
      </div>

      {/* KPI GRID */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-title">Vendas Totais</div>
          <div className="stat-value">$ {fmt(totalReceita)}</div>
          <div style={{ fontSize: 12, color: 'var(--wp-yellow)', marginTop: 8, fontWeight: 700 }}>+ $ {fmt(totalReceita * 0.1)} (ESTIMADO)</div>
          <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '50px', background: 'linear-gradient(to top, rgba(255,215,0,0.08), transparent)', opacity: 0.6 }} />
        </div>
        
        <div className="stat-card">
          <div className="stat-title">Receita Bruta</div>
          <div className="stat-value">$ {fmt(totalReceita)}</div>
          <div style={{ fontSize: 12, color: 'var(--wp-yellow)', marginTop: 8, fontWeight: 700 }}>PAINEL ATIVO</div>
          <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '50px', background: 'linear-gradient(to top, rgba(255,215,0,0.08), transparent)', opacity: 0.6 }} />
        </div>

        <div className="stat-card">
          <div className="stat-title">Margem Operacional</div>
          <div className="stat-value" style={{ color: lucro >= 0 ? 'var(--wp-yellow)' : '#ef4444' }}>
            {margem.toFixed(1)}%
          </div>
          <div style={{ fontSize: 12, color: '#999', marginTop: 8 }}>Lucro: $ {fmt(lucro)}</div>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="dash-bottom" style={{ marginTop: 40, display: 'grid', gridTemplateColumns: '2fr 1.2fr', gap: 30 }}>
        
        {/* TABELA DE PEDIDOS (STILL TECH STYLE) */}
        <div className="table-wrap" style={{ padding: '32px', background: '#fff', border: '1px solid #e2e2e2' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: '#1a1a1a' }}>Gestão de Pedidos</h3>
            <div className="btn-ghost" style={{ padding: '8px 16px', fontSize: 12, borderRadius: '10px' }}>Filtrar Período ▾</div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Identificador</th>
                <th>Data/Hora</th>
                <th>Status</th>
                <th>Ação</th>
              </tr>
            </thead>
            <tbody>
              {produtos.slice(0, 6).map(p => (
                <tr key={p.id}>
                  <td style={{ fontWeight: 700, color: '#1a1a1a' }}>{p.nome.split(' ')[0]}_{p.id.slice(0,4)}</td>
                  <td style={{ color: '#888', fontSize: 13 }}>29/04/2026</td>
                  <td><span className="badge-yellow" style={{ background: 'var(--wp-yellow)', color: '#000', padding: '4px 10px', borderRadius: '6px', fontSize: 10, fontWeight: 800 }}>ESTÁVEL</span></td>
                  <td><span style={{ color: 'var(--wp-yellow)', fontWeight: 800, cursor: 'pointer', fontSize: 12 }}>DETALHES</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* SIDE ACTIONS / CONFIGS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div className="stat-card" style={{ background: '#fff', color: '#1a1a1a', border: '1px solid #e2e2e2', boxShadow: 'none' }}>
            <div className="stat-title" style={{ color: '#888' }}>Configurações Rápidas</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 20 }}>
              {['Catálogo de Produtos', 'Base de Clientes', 'Fluxo de Caixa', 'Configurações'].map(item => (
                <div key={item} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderBottom: '1px solid #f0f0f0', cursor: 'pointer' }}>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>{item}</span>
                  <span style={{ color: '#ccc' }}>→</span>
                </div>
              ))}
            </div>
          </div>

          <div className="stat-card" style={{ background: 'var(--grad-metallic)', border: 'none' }}>
             <div className="stat-title">Suporte Técnico</div>
             <p style={{ fontSize: 13, color: '#aaa', marginTop: 10 }}>Precisa de ajuda com a integração? Entre em contato com os desenvolvedores.</p>
             <button className="btn-primary" style={{ marginTop: 20, width: '100%', fontSize: 12 }}>ABRIR CHAMADO</button>
          </div>
        </div>

      </div>

      <style>{`
        @keyframes pulse {
          0% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.2); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  )
}
