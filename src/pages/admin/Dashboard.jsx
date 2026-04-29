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
      console.error("Critical System Load Error:", err)
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

  if (loading) return (
    <div style={{ height: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
      <div className="loader"></div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 800, color: 'var(--text-dark)', letterSpacing: '0.2em' }}>SYSTEM_BOOTING...</div>
    </div>
  )

  return (
    <div>
      <div style={{ marginBottom: 48 }}>
        <h1 style={{ fontSize: 42, fontWeight: 900, letterSpacing: '-0.05em', color: '#FFF' }}>Overview <span style={{ color: 'var(--wp-yellow)' }}>Matrix</span></h1>
        <p style={{ color: 'var(--text-dim)', fontSize: 16, marginTop: 8 }}>Operational intelligence and financial distribution nodes.</p>
      </div>

      {/* 📊 KPI MATRIX */}
      <div className="stats-grid">
        <div className="stat-box">
          <div className="stat-title">Invested Capital</div>
          <div className="stat-value">R$ {fmt(stats.investido)}</div>
          <div className="stat-trend" style={{ color: 'var(--text-dark)' }}>
             NET_COST_EXPOSURE
          </div>
        </div>
        <div className="stat-box" style={{ borderLeft: '4px solid var(--wp-yellow)' }}>
          <div className="stat-title">Gross Revenue</div>
          <div className="stat-value">R$ {fmt(stats.faturamento)}</div>
          <div className="stat-trend" style={{ color: 'var(--wp-yellow)' }}>
             ⚡ +12.4% PERFORMANCE
          </div>
        </div>
        <div className="stat-box">
          <div className="stat-title">Net Profit</div>
          <div className="stat-value" style={{ color: 'var(--wp-yellow)' }}>R$ {fmt(stats.lucro)}</div>
          <div className="stat-trend" style={{ color: '#4ade80' }}>
             🚀 GROWTH_OPTIMIZED
          </div>
        </div>
        <div className="stat-box" style={{ background: 'linear-gradient(135deg, rgba(255,215,0,0.1) 0%, transparent 100%)' }}>
          <div className="stat-title">Partner Yield</div>
          <div className="stat-value">R$ {fmt(stats.lucro / 2)}</div>
          <div className="stat-trend">DISTRIBUTION_ACTIVE</div>
        </div>
      </div>

      {/* 🧱 DATA NODES */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 32 }}>
        
        {/* RECENT OPERATIONS */}
        <div className="premium-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
             <h3 style={{ fontSize: 18, fontWeight: 800, fontFamily: 'var(--font-mono)' }}>Operations Log</h3>
             <button style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-dim)', padding: '6px 12px', borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>EXPORT_CSV</button>
          </div>
          
          <table className="wp-surface">
            <thead>
              <tr>
                <th>Resource</th>
                <th>Units</th>
                <th>Volume</th>
                <th>Type</th>
              </tr>
            </thead>
            <tbody>
              {data.vendas.slice(0, 7).map(v => (
                <tr key={v.id}>
                  <td>
                    <div style={{ fontWeight: 700 }}>{v.nome_produto}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-dark)' }}>{v.sabor_produto}</div>
                  </td>
                  <td style={{ fontWeight: 600 }}>{v.quantidade} <span style={{fontSize:10, color:'var(--text-dark)'}}>UN</span></td>
                  <td style={{ fontWeight: 800 }}>R$ {fmt(v.preco_venda)}</td>
                  <td>
                    <span className="status-chip success">TERMINAL_SALE</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* REQUESTS PIPELINE */}
        <div className="premium-card gold-edge" style={{ background: 'linear-gradient(180deg, #18181b 0%, #09090b 100%)' }}>
          <h3 style={{ fontSize: 18, fontWeight: 800, fontFamily: 'var(--font-mono)', marginBottom: 32 }}>Requests Pipeline</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {data.pedidos.slice(0, 6).map(p => (
              <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 20, borderBottom: '1px solid var(--border)' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#FFF' }}>REQ_{String(p.id).slice(-6).toUpperCase()}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-dark)', marginTop: 2 }}>{new Date(p.created_at).toLocaleDateString()}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 900, color: 'var(--wp-yellow)' }}>R$ {fmt(p.total)}</div>
                  <span className={`status-chip ${p.status === 'Confirmado' ? 'success' : ''}`} style={{ fontSize: 9, marginTop: 6, display: 'inline-block' }}>
                    {p.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <button className="btn-ultimate" style={{ width: '100%', marginTop: 32, height: 48, fontSize: 12 }}>
             ACCESS_ALL_REQUESTS
          </button>
        </div>

      </div>
    </div>
  )
}
