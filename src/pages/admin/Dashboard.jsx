import { useState, useEffect, useMemo } from 'react'
import { sb } from '../../lib/supabase'
import { fmt } from '../../lib/utils'

export default function Dashboard() {
  const [data, setData] = useState({ vendas: [], compras: [], pedidos: [] })
  const [loading, setLoading] = useState(true)

  const carregar = async () => {
    setLoading(true)
    const [v, c, p] = await Promise.all([
      sb.from('vendas').select('*').order('data', { ascending: false }),
      sb.from('compras').select('*'),
      sb.from('pedidos').select('*').order('created_at', { ascending: false })
    ])
    setData({ vendas: v.data || [], compras: c.data || [], pedidos: p.data || [] })
    setLoading(false)
  }

  useEffect(() => { carregar() }, [])

  const stats = useMemo(() => {
    const investido = data.compras.reduce((a, b) => a + (parseFloat(b.custo || 0) * parseInt(b.quantidade || 0)) + parseFloat(b.frete || 0), 0)
    const fatVendas = data.vendas.reduce((a, b) => a + (parseFloat(b.preco_venda || 0) * parseInt(b.quantidade || 0)), 0)
    const fatPedidos = data.pedidos.filter(p => p.status === 'Confirmado').reduce((a, b) => a + parseFloat(b.total || 0), 0)
    const faturamento = fatVendas + fatPedidos
    return { investido, faturamento, lucro: faturamento - investido, porSocio: (faturamento - investido) / 2 }
  }, [data])

  if (loading) return <div style={{ padding: 40, color: 'var(--text-muted)' }}>Sincronizando ativos...</div>

  return (
    <div>
      <div className="stat-grid">
        <div className="stat-card" style={{ borderLeft: '4px solid #3b82f6' }}>
          <div className="stat-label">Investimento Total</div>
          <div className="stat-value">R$ {fmt(stats.investido)}</div>
        </div>
        <div className="stat-card" style={{ borderLeft: '4px solid var(--wp-yellow)' }}>
          <div className="stat-label">Receita Bruta</div>
          <div className="stat-value">R$ {fmt(stats.faturamento)}</div>
        </div>
        <div className="stat-card" style={{ borderLeft: '4px solid #10b981' }}>
          <div className="stat-label">Lucro Líquido</div>
          <div className="stat-value" style={{ color: '#10b981' }}>R$ {fmt(stats.lucro)}</div>
        </div>
        <div className="stat-card" style={{ background: 'linear-gradient(145deg, #1a1a1a 0%, #0d0d0d 100%)', border: '1px solid var(--wp-yellow)' }}>
          <div className="stat-label" style={{ color: 'var(--wp-yellow)' }}>Cota por Sócio</div>
          <div className="stat-value" style={{ color: 'var(--wp-yellow)' }}>R$ {fmt(stats.porSocio)}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 32 }}>
        <div className="card">
          <h3 style={{ marginBottom: 24, fontSize: 16 }}>Movimentação Recente</h3>
          <table className="table-container">
            <thead>
              <tr>
                <th>Produto</th>
                <th>Qtd</th>
                <th>Valor</th>
                <th>Tipo</th>
              </tr>
            </thead>
            <tbody>
              {data.vendas.slice(0, 6).map(v => (
                <tr key={v.id}>
                  <td><strong>{v.nome_produto}</strong> <br/><small style={{color: 'var(--text-muted)'}}>{v.sabor_produto}</small></td>
                  <td>{v.quantidade} un</td>
                  <td style={{ fontWeight: 700 }}>R$ {fmt(v.preco_venda)}</td>
                  <td><span style={{ fontSize: 10, background: 'rgba(255,215,0,0.1)', color: 'var(--wp-yellow)', padding: '4px 8px', borderRadius: 4, fontWeight: 800 }}>VENDA</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: 24, fontSize: 16 }}>Status de Pedidos</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {data.pedidos.slice(0, 5).map(p => (
              <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>PEDIDO #{String(p.id).slice(-4)}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{new Date(p.created_at).toLocaleDateString()}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 800, color: 'var(--wp-yellow)' }}>R$ {fmt(p.total)}</div>
                  <div style={{ fontSize: 10, fontWeight: 900, color: p.status === 'Confirmado' ? '#10b981' : '#52525b' }}>{p.status.toUpperCase()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
