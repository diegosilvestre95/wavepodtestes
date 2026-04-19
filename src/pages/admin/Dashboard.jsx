import { useState, useEffect } from 'react'
import { sb } from '../../lib/supabase'
import { fmt } from '../../lib/utils'
import Badge from '../../components/Badge'

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
    // Escuta eventos realtime globais
    const onPed = () => carregar()
    window.addEventListener('wvpod:pedidoatualizado', onPed)
    window.addEventListener('wvpod:novopedido', onPed)
    return () => {
      window.removeEventListener('wvpod:pedidoatualizado', onPed)
      window.removeEventListener('wvpod:novopedido', onPed)
    }
  }, [])

  if (loading) return <div className="empty"><span>⏳</span>Carregando...</div>
  const { totalInvestido, totalReceita, lucro, margem, allVals, produtos } = stats
  const maxV = Math.max(...allVals, 1)
  const totalUnids = produtos.reduce((a, p) => a + (p.quantidade || 0), 0)

  return (
    <div className="container">
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-icon">💸</span>
          <div className="stat-title">Total investido</div>
          <div className="stat-value">R$ {fmt(totalInvestido)}</div>
          <div className="stat-sub">Soma das compras realizadas</div>
        </div>
        <div className="stat-card">
          <span className="stat-icon">💰</span>
          <div className="stat-title">Receita total</div>
          <div className="stat-value">R$ {fmt(totalReceita)}</div>
          <div className="stat-sub">Vendas + pedidos confirmados</div>
        </div>
        <div className="stat-card">
          <span className="stat-icon">📈</span>
          <div className="stat-title">Lucro líquido</div>
          <div className={`stat-value ${lucro >= 0 ? 'green' : 'red'}`}>R$ {fmt(lucro)}</div>
          <div className="stat-sub">Margem: {margem.toFixed(1)}%</div>
        </div>
        <div className="stat-card">
          <span className="stat-icon">👥</span>
          <div className="stat-title">Lucro por sócio</div>
          <div className={`stat-value ${lucro >= 0 ? 'green' : 'red'}`}>R$ {fmt(lucro / 2)}</div>
          <div className="stat-sub">50% cada · divisão automática</div>
        </div>
      </div>

      <div className="dash-bottom">
        {/* Gráfico */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <h3 style={{ margin: 0, fontFamily: 'Outfit, sans-serif', fontSize: 15, fontWeight: 700 }}>Receita por operação</h3>
            <span className="badge badge-green">{allVals.length} operação{allVals.length !== 1 ? 's' : ''}</span>
          </div>
          <div className="chart-wrap">
            {allVals.length === 0
              ? <div className="chart-empty">Nenhuma venda ainda</div>
              : allVals.map((v, i) => (
                <div key={i} className="bar"
                  style={{ height: Math.max(6, (v / maxV) * 140) }}
                  title={`R$ ${fmt(v)}`} />
              ))
            }
          </div>
        </div>

        {/* Estoque rápido */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <h3 style={{ margin: 0, fontFamily: 'Outfit, sans-serif', fontSize: 15, fontWeight: 700 }}>Estoque rápido</h3>
            <span className="badge badge-amber">{totalUnids} unidade{totalUnids !== 1 ? 's' : ''}</span>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Produto</th><th>Sabor</th><th>Qtd</th><th>Status</th></tr>
              </thead>
              <tbody>
                {produtos.map(p => (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 500 }}>{p.nome}</td>
                    <td style={{ color: 'var(--muted)' }}>{p.sabor || '—'}</td>
                    <td>{p.quantidade}</td>
                    <td><Badge tipo={p.quantidade} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {produtos.length === 0 && <div className="empty"><span>📦</span>Nenhum produto</div>}
          </div>
        </div>
      </div>
    </div>
  )
}
