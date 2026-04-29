import { useState, useEffect } from 'react'
import { sb } from '../../lib/supabase'
import { fmt } from '../../lib/utils'

export default function Estoque() {
  const [produtos, setProdutos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { carregarDados() }, [])

  const carregarDados = async () => {
    setLoading(true)
    const { data } = await sb.from('produtos').select('*').order('nome')
    setProdutos(data || [])
    setLoading(false)
  }

  const getSt = (q) => q <= 0 ? { class: '', label: 'DEPLETED' } : q < 5 ? { class: 'warning', label: 'CRITICAL' } : { class: 'success', label: 'OPTIMAL' }

  if (loading) return (
    <div style={{ height: '40vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div className="loader"></div>
    </div>
  )

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 48 }}>
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 900, color: '#FFF' }}>Resource <span style={{ color: 'var(--wp-yellow)' }}>Inventory</span></h1>
          <p style={{ color: 'var(--text-dim)', fontSize: 14 }}>Real-time audit of all active stock nodes.</p>
        </div>
        <div className="premium-card" style={{ padding: '12px 32px', display: 'flex', gap: 32, alignItems: 'center' }}>
           <div>
              <div className="stat-title" style={{ marginBottom: 0 }}>Total Units</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--wp-yellow)' }}>{produtos.reduce((a, b) => a + (b.quantidade || 0), 0)}</div>
           </div>
           <div style={{ width: 1, height: 32, background: 'var(--border)' }}></div>
           <div>
              <div className="stat-title" style={{ marginBottom: 0 }}>Active SKU</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#FFF' }}>{produtos.length}</div>
           </div>
        </div>
      </div>

      <div className="premium-card">
        <table className="wp-surface">
          <thead>
            <tr>
              <th>Resource Node</th>
              <th>Sabor / Spec</th>
              <th>Yield (Venda)</th>
              <th>Exposure (Custo)</th>
              <th>Volume</th>
              <th style={{ textAlign: 'right' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {produtos.map(p => {
              const st = getSt(p.quantidade)
              return (
                <tr key={p.id}>
                  <td style={{ fontWeight: 800, color: '#FFF' }}>{p.nome}</td>
                  <td style={{ color: 'var(--text-dim)' }}>{p.sabor || '—'}</td>
                  <td style={{ fontWeight: 700, color: 'var(--wp-yellow)' }}>R$ {fmt(p.preco_venda)}</td>
                  <td style={{ color: 'var(--text-dark)', fontSize: 12 }}>R$ {fmt(p.custo)}</td>
                  <td style={{ fontSize: 18, fontWeight: 900 }}>{p.quantidade} <span style={{ fontSize: 10, color: 'var(--text-dark)' }}>UN</span></td>
                  <td style={{ textAlign: 'right' }}>
                    <span className={`status-chip ${st.class}`}>
                      {st.label}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
