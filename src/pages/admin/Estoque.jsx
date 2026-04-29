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

  const getSt = (q) => q <= 0 ? { class: 'badge-warning', label: 'DEPLETED' } : q < 5 ? { class: 'badge-warning', label: 'LOW_STOCK' } : { class: 'badge-success', label: 'OPTIMAL' }

  if (loading) return <div style={{ padding: 40, color: 'var(--text-muted)' }}>LOADING_INVENTORY...</div>

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800 }}>Inventory Hub</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Real-time resource node status and valuation.</p>
        </div>
        <div style={{ display: 'flex', gap: 24, background: '#FFF', padding: '12px 24px', border: '1px solid var(--border)', borderRadius: 6 }}>
           <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)' }}>GLOBAL VOLUME</div>
              <div style={{ fontSize: 18, fontWeight: 800 }}>{produtos.reduce((a, b) => a + (b.quantidade || 0), 0)} <span style={{fontSize:10}}>UN</span></div>
           </div>
        </div>
      </div>

      <div style={{ background: '#FFF', border: '1px solid var(--border)', borderRadius: 6, overflow: 'hidden' }}>
        <table className="data-table" style={{ border: 'none' }}>
          <thead>
            <tr>
              <th>Resource Name</th>
              <th>Specification</th>
              <th>Asset Cost</th>
              <th>Sale Price</th>
              <th>Current Volume</th>
              <th>Status Node</th>
            </tr>
          </thead>
          <tbody>
            {produtos.map(p => {
              const st = getSt(p.quantidade)
              return (
                <tr key={p.id}>
                  <td style={{ fontWeight: 700 }}>{p.nome}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{p.sabor || '—'}</td>
                  <td>R$ {fmt(p.custo)}</td>
                  <td style={{ fontWeight: 700 }}>R$ {fmt(p.preco_venda)}</td>
                  <td style={{ fontSize: 14, fontWeight: 800 }}>{p.quantidade} <small style={{fontSize:9}}>UN</small></td>
                  <td>
                    <span className={`badge ${st.class}`}>
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
