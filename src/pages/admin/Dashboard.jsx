import { useState, useEffect, useMemo } from 'react'
import { sb } from '../../lib/supabase'
import { fmt } from '../../lib/utils'

export default function Dashboard() {
  const [data, setData] = useState({ vendas: [], compras: [], pedidos: [] })
  const [loading, setLoading] = useState(true)

  const carregar = async () => {
    setLoading(true)
    try {
      const [v, c, p] = await Promise.all([
        sb.from('vendas').select('*').order('data', { ascending: false }),
        sb.from('compras').select('*'),
        sb.from('pedidos').select('*').order('created_at', { ascending: false })
      ])
      setData({ vendas: v.data || [], compras: c.data || [], pedidos: p.data || [] })
    } catch (err) {
      console.error("Falha ao carregar dashboard:", err)
    }
    setLoading(false)
  }

  useEffect(() => { carregar() }, [])

  const stats = useMemo(() => {
    const investido = data.compras.reduce((a, b) => a + (parseFloat(b.custo || 0) * parseInt(b.quantidade || 0)) + parseFloat(b.frete || 0), 0)
    const fatVendas = data.vendas.reduce((a, b) => a + (parseFloat(b.preco_venda || 0) * parseInt(b.quantidade || 0)), 0)
    const fatPedidos = data.pedidos.filter(p => p.status === 'Confirmado').reduce((a, b) => a + parseFloat(b.total || 0), 0)
    const faturamento = fatVendas + fatPedidos
    return { investido, faturamento, lucro: faturamento - investido }
  }, [data])

  if (loading) return <div style={{ padding: 40, color: 'var(--text-muted)' }}>SINCRONIZANDO DADOS...</div>

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800 }}>Visão Analítica</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Métricas operacionais e financeiras em tempo real.</p>
      </div>

      {/* 📊 KPI ROW (4 CARDS) */}
      <div className="dashboard-grid">
        <div className="kpi-card">
          <div className="kpi-title">Capital Investido</div>
          <div className="kpi-value">R$ {fmt(stats.investido)}</div>
          <div className="kpi-trend" style={{ color: 'var(--text-muted)' }}>Exposição em Estoque</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-title">Faturamento Bruto</div>
          <div className="kpi-value">R$ {fmt(stats.faturamento)}</div>
          <div className="kpi-trend" style={{ color: '#16a34a' }}>Vendas + Pedidos Confirmados</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-title">Lucro Líquido</div>
          <div className="kpi-value" style={{ color: 'var(--wp-yellow-dark)' }}>R$ {fmt(stats.lucro)}</div>
          <div className="kpi-trend" style={{ color: '#16a34a' }}>Performance Operacional</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-title">Rendimento Sócios</div>
          <div className="kpi-value">R$ {fmt(stats.lucro / 2)}</div>
          <div className="kpi-trend">Divisão Fixa 50/50</div>
        </div>
      </div>

      {/* 🧱 DATA BLOCKS */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr', gap: 24 }}>
        
        {/* RECENT SALES (DENSE TABLE) */}
        <div style={{ background: '#FFF', padding: 24, border: '1px solid var(--border)', borderRadius: 6 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
             <h3 style={{ fontSize: 14, fontWeight: 700 }}>Log de Operações</h3>
             <button className="btn-outline" style={{ padding: '4px 10px', fontSize: 10 }}>VER TUDO</button>
          </div>
          
          <table className="data-table">
            <thead>
              <tr>
                <th>Produto</th>
                <th>Qtd</th>
                <th>Valor Un.</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {data.vendas.slice(0, 10).map(v => (
                <tr key={v.id}>
                  <td>
                    <div style={{ fontWeight: 700 }}>{v.nome_produto}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{v.sabor_produto}</div>
                  </td>
                  <td>{v.quantidade} <small>UN</small></td>
                  <td style={{ fontWeight: 700 }}>R$ {fmt(v.preco_venda)}</td>
                  <td><span className="badge badge-success">CONCLUÍDO</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* PIPELINE (DENSE LIST) */}
        <div style={{ background: '#FFF', padding: 24, border: '1px solid var(--border)', borderRadius: 6 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 20 }}>Fila de Pedidos</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {data.pedidos.slice(0, 8).map(p => (
              <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #F3F4F6' }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700 }}>{p.cliente_nome} {p.cliente_sobrenome}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>#{String(p.id).slice(-6).toUpperCase()}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 800 }}>R$ {fmt(p.total)}</div>
                  <div style={{ fontSize: 9, color: p.status === 'Confirmado' ? '#166534' : '#6B7280', fontWeight: 800 }}>{p.status.toUpperCase()}</div>
                </div>
              </div>
            ))}
          </div>
          <button className="btn-primary" style={{ width: '100%', marginTop: 20 }}>GERENCIAR PEDIDOS</button>
        </div>

      </div>
    </div>
  )
}
